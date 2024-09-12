import path from 'path';

import { LAST_LAYER_VERSION } from 'src/engine/core-modules/serverless/drivers/layers/last-layer-version';

// Can only be used in src/engine/integrations/serverless/drivers/utils folder
export const getLayerDependenciesDirName = (
  version: 'latest' | 'engine' | number,
): string => {
  const formattedVersion = version === 'latest' ? LAST_LAYER_VERSION : version;

  return path.resolve(__dirname, `../layers/${formattedVersion}`);
};
