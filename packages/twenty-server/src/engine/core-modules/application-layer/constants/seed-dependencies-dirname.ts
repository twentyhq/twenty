import path from 'path';

import { ASSET_PATH } from 'src/constants/assets-path';

export const SEED_DEPENDENCIES_DIRNAME = path.resolve(
  __dirname,
  path.join(
    ASSET_PATH,
    'engine/core-modules/application-layer/constants/seed-dependencies',
  ),
);
