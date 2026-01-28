import path from 'path';

import { ASSET_PATH } from 'src/constants/assets-path';

export const getExecutorFilePath = (): string => {
  const baseTypescriptProjectPath = path.join(
    ASSET_PATH,
    `engine/core-modules/logic-function-executor/drivers/constants/executor`,
  );

  return path.resolve(__dirname, baseTypescriptProjectPath);
};
