#!/usr/bin/env node
const message = `\nTwenty CLI (twenty-cli) is deprecated.\n\nPlease install and use the new package instead:\n  npm install -g twenty-sdk\n\nThe command name remains the same: \"twenty\".\nMore info: https://www.npmjs.com/package/twenty-sdk\n`;

console.error(message);
process.exitCode = 1;
