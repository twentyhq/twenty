import path from 'path';

export const ASSET_PATH =
  process.env.NODE_ENV === 'test'
    ? path.resolve(__dirname, `../../dist/assets`)
    : path.resolve(__dirname, `../../assets`);
