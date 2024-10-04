import path from 'path';

console.log('__dirname', __dirname);
console.log('__dirname.endsWith', __dirname.endsWith('dist'));
export const ASSET_PATH = __dirname.endsWith('dist')
  ? path.resolve(__dirname, `../../assets`)
  : path.resolve(__dirname, `../../dist/assets`);
