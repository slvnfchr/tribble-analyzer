
'use strict';

const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const modulor = require('../lib/index');

function sanitize(filepath) {
	const data = fs.readFileSync(filepath, 'utf8');
	const result = data.replace(/([^"'\s:]+):/gi, (key) => `"${key.replace(/:$/, '')}":`) // encapsulate keys in double quotes
		.replace(/'/gi, '"') // replace single quotes by double quotes
		.replace(/\/\/[^\n]+/gi, ''); // remove comments
	return JSON.parse(result);
}

describe('Examples', () => {

	it('Local example', (done) => {
		modulor(path.resolve(__dirname, 'examples/local'), ['*.html']).on('data', (configuration) => {
			const bundles = [
				{
					name: './lib/common',
					include: ['./lib/test'],
				},
				{
					name: '2.js',
					exclude: ['./lib/common'],
				},
				{
					name: '3.js',
					include: ['./lib/module1'],
					exclude: ['./lib/common'],
				},
				{
					name: '4.js',
					include: ['./lib/module2'],
					exclude: ['./lib/common'],
				},
				{
					name: './lib/test',
					include: ['./lib/module4', './lib/module3'],
					exclude: ['./lib/common'],
				},
			];
			expect(configuration.modules).to.deep.equal(bundles);
		}).on('end', () => {
			done();
		});
	});

	it('RequireJS multipage example', (done) => {
		const folder = path.resolve(__dirname, 'examples/requirejs-multipage/');
		const analyzer = modulor(path.resolve(folder, 'www')).on('data', (configuration) => {
			expect(analyzer.type).to.equal(modulor.types.REQUIREJS);
			const target = sanitize(path.resolve(folder, './tools/build.js'));
			expect(configuration.modules).to.deep.equal(target.modules);
		}).on('end', () => {
			done();
		});
	});

	it('RequireJS jQuery CDN example', (done) => {
		const folder = path.resolve(__dirname, 'examples/requirejs-jquery-cdn/');
		modulor(path.resolve(folder, 'www')).on('data', (configuration) => {
			const target = sanitize(path.resolve(folder, './tools/build.js'));
			expect(configuration.modules).to.deep.equal(target.modules);
		}).on('end', () => {
			done();
		});
	});

});
