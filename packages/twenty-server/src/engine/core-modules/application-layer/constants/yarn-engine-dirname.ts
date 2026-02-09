import path from 'path';

import { ASSET_PATH } from 'src/constants/assets-path';

export const YARN_ENGINE_DIRNAME = path.resolve(
  __dirname,
  path.join(
    ASSET_PATH,
    'engine/core-modules/application-layer/constants/yarn-engine',
  ),
);
