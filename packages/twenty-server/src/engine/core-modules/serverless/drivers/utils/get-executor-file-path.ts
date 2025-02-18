import path, { join } from 'path';

import { ASSET_PATH } from 'src/constants/assets-path';

export const getExecutorFilePath = (): string => {
  const baseTypescriptProjectPath = join(
    ASSET_PATH,
    `engine/core-modules/serverless/drivers/constants/executor`,
  );

  return path.resolve(baseTypescriptProjectPath);
};
