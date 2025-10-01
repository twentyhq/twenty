import path from 'path';

import { ASSET_PATH } from 'src/constants/assets-path';

export const getLayerDependenciesDirName = (
  version: 'engine' | number,
): string => {
  const baseTypescriptProjectPath = path.join(
    ASSET_PATH,
    `engine/core-modules/serverless/drivers/layers/${version}`,
  );

  return path.resolve(__dirname, baseTypescriptProjectPath);
};
