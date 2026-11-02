import path from 'path';

import { ASSET_PATH } from 'src/constants/assets-path';

export const STANDARD_APPLICATION_DEPENDENCIES_DIRECTORY_NAME = path.resolve(
  __dirname,
  path.join(
    ASSET_PATH,
    'engine/core-modules/application/application-package/constants/standard-application-dependencies',
  ),
);
