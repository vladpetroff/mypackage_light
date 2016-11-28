'use strict';

const gulp = require('gulp');  //https://www.npmjs.com/package/gulp-4.0.build
const sass = require('gulp-sass');  //https://www.npmjs.com/package/gulp-sass/
const jade = require('gulp-jade'); //https://www.npmjs.com/package/gulp-jade/
const debug = require('gulp-debug');  //https://www.npmjs.com/package/gulp-debug/
const browserSync = require("browser-sync").create();  //https://www.npmjs.com/package/browser-sync
const reload = browserSync.reload;
const sourcemaps = require('gulp-sourcemaps');  //https://www.npmjs.com/package/gulp-sourcemaps
const del = require('del'); // Удаляет файлы. https://www.npmjs.com/package/del
const newer = require('gulp-newer'); // копирует только новые файлы. https://www.npmjs.com/package/gulp-newer
const autoprefixer = require('gulp-autoprefixer');  //https://www.npmjs.com/package/gulp-autoprefixer/


/* Обработка ошибок */
const notify = require('gulp-notify'); // https://www.npmjs.com/package/gulp-notify
const plumber = require('gulp-plumber'); // передает onError через все потоки по цепочке


/************************************************/

const path = {
	public: { //Тут мы укажем куда складывать готовые после сборки файлы
		html: 'public/',
		jade: 'src/*.jade',
		scripts: 'public/js/',
		style: 'public/css/',
		fonts: 'public/fonts/',
		assets: 'public/',
		img: 'public/img/'
	},
	src: { // Пути откуда копируем исходники
		scripts: [
			'assets/js/**/*.js',
			'src/bower_components/bootstrap-sass/assets/javascripts/bootstrap.min.js',
			//'src/bower_components/jquery/public/jquery.min.js'
		],
		style: 'assets/css/*.css',
		fonts: 'assets/fonts/*.*',
		assets: 'assets/**/*.*'
	},
	watch: { // Укажем, за изменением каких файлов мы хотим наблюдать
		html: 'public/*.html',
		jade: 'src/**/*.jade',
		jadeIncl: 'src/includes/*.jade',
		scripts: 'src/js/*.js', // только скрипты верхнего уровня
		sass: [
			'src/bower_components/bootstrap-sass/assets/stylesheets/bootstrap/**/*.scss',
			'src/css/*.scss'
		],
		assets: 'assets/css/*.*',
		style: 'src/css/*.css',
		img: 'src/img/**/*.*'
	},
	clean: { // Файлы, которые нужно удалить после сборки
		map: 'public/css/*.map',
		includes: 'public/includes'
	}
};

/************************************************/

gulp.task('assets', function () {
	return gulp.src(path.src.assets, {since: gulp.lastRun('assets')})
		//.pipe(debug({title: "assets;"}))
		.pipe(newer(path.src.assets))
		.pipe(gulp.dest('public'))
});

gulp.task('jade', function () {
	return gulp.src(path.public.jade, {since: gulp.lastRun('jade')})
		//.pipe(debug({title: "jade;"}))
		.pipe(plumber({
			errorHandler: notify.onError(function(err) {
				return {
					title: 'Jade',
					message: err.message
				};
			})
		}))
		.pipe(jade({
			pretty: true
		}))
		//.pipe(newer(path.public.jade))
		//.pipe(newer(path.watch.jade))
		.pipe(gulp.dest(path.public.html))
});

gulp.task('jadeAll', function () {
	return gulp.src(path.public.jade)
		.pipe(plumber({
			errorHandler: notify.onError(function(err) {
				return {
					title: 'JadeAll',
					message: err.message
				};
			})
		}))
		.pipe(jade({
			pretty: true
		}))
		.pipe(gulp.dest(path.public.html))
});

gulp.task('jadeIncl', function () {
	return gulp.src(path.watch.jadeIncl)
		.pipe(plumber({
			errorHandler: notify.onError(function(err) {
				return {
					title: 'JadeIncl',
					message: err.message
				};
			})
		}))
		.pipe(jade({
			pretty: true
		}))
		.pipe(gulp.dest(path.watch.jade))
});


gulp.task('sass', function () {
	return gulp.src(path.watch.sass) //, {since: gulp.lastRun('sass')}
		//.pipe(debug({title: "sass;"}))
		.pipe(plumber({
			errorHandler: notify.onError(function(err) {
				return {
					title: 'Sass',
					message: err.message
				};
			})
		}))
		.pipe(newer(path.public.style))
		.pipe(sourcemaps.init()) // file получил пустой sourcemap
		.pipe(sass())
		.pipe(autoprefixer('last 5 versions'))
		.pipe(sourcemaps.write('.'))  // заполняем sourcemap и кладем в тот же каталог отдельно
		//.pipe(debug({title: "sass:"}))
		.pipe(gulp.dest(path.public.style))
});


gulp.task('clean', function () {
	return del([path.clean.includes, path.clean.map]);
});

gulp.task('imagecopy', function () {
	return gulp.src(path.watch.img)
		.pipe(plumber({
			errorHandler: notify.onError(function(err) {
				return {
					title: 'Image',
					message: err.message
				};
			})
		}))
		.pipe(newer(path.public.img))
		//.pipe(debug({title: "imagemin;"}))
		.pipe(gulp.dest(path.public.img))
});

gulp.task('browserSync', function () {
	browserSync.init({
		server: {
			baseDir: path.public.html
		},
		port: 8080,
		open: true,
		notify: false
	});
	browserSync.watch('public/**/*.*').on('change', browserSync.reload);
});

/***********************************************/

gulp.task('watch', function() {
	gulp.watch(path.watch.sass, gulp.series('sass'));
	//gulp.watch(path.watch.scripts, gulp.series('scripts'));
	gulp.watch(path.watch.jade, gulp.series('jade'));
	gulp.watch(path.watch.jadeIncl, gulp.series('jadeAll'));
	gulp.watch(path.watch.assets, gulp.series('assets'));
	gulp.watch(path.watch.img, gulp.series('imagecopy'));
});

gulp.task('default', gulp.series(
	gulp.parallel('jade', 'sass', 'assets'),
	gulp.parallel('watch', 'browserSync')
	)
);

gulp.task('build', gulp.series('clean'));
