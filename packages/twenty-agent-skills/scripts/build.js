#!/usr/bin/env node

const { buildDistribution } = require('./lib');

buildDistribution();
console.log('Twenty skills and Codex plugin distribution built in dist/.');
