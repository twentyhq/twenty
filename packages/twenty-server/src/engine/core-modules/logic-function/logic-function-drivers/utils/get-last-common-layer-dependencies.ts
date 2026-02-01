import fs from 'fs/promises';
import { join } from 'path';

import { getLayerDependenciesDirName } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/get-layer-dependencies-dir-name';
import { LAST_LAYER_VERSION } from 'src/engine/core-modules/logic-function/logic-function-drivers/layers/last-layer-version';

export type LayerDependencies = {
  packageJson: string;
  yarnLock: string;
};

export const getLastCommonLayerDependencies = async (
  layerVersion = LAST_LAYER_VERSION,
): Promise<LayerDependencies> => {
  const lastVersionLayerDirName = getLayerDependenciesDirName(layerVersion);
  const [packageJson, yarnLock] = await Promise.all([
    fs.readFile(join(lastVersionLayerDirName, 'package.json'), 'utf8'),
    fs.readFile(join(lastVersionLayerDirName, 'yarn.lock'), 'utf8'),
  ]);

  return { packageJson, yarnLock };
};
