import path, { join } from 'path';

import { LAST_LAYER_VERSION } from 'src/engine/core-modules/serverless/drivers/layers/last-layer-version';
import { ASSET_PATH } from 'src/constants/assets-path';

export const getLayerDependenciesDirName = (
  version: 'latest' | 'engine' | number,
): string => {
  const formattedVersion = version === 'latest' ? LAST_LAYER_VERSION : version;

  const baseTypescriptProjectPath = join(
    ASSET_PATH,
    `engine/core-modules/serverless/drivers/layers/${formattedVersion}`,
  );

  return path.resolve(baseTypescriptProjectPath);
};
