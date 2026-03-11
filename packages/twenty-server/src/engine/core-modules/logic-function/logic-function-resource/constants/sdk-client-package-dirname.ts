import path from 'path';

import { ASSET_PATH } from 'src/constants/assets-path';

const IS_BUILT = __dirname.includes('/dist/');

// In built mode, the twenty-client-sdk package is copied into dist/assets/
// by the build step. In dev mode, resolve from node_modules.
export const SDK_CLIENT_PACKAGE_DIRNAME = IS_BUILT
  ? path.join(ASSET_PATH, 'twenty-client-sdk')
  : path.resolve(require.resolve('twenty-client-sdk/core'), '..', '..');
