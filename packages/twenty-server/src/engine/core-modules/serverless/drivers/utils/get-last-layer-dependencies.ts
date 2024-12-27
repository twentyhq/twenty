import fs from 'fs/promises';
import { join } from 'path';

import { getLayerDependenciesDirName } from 'src/engine/core-modules/serverless/drivers/utils/get-layer-dependencies-dir-name';

export type LayerDependencies = {
  packageJson: { dependencies: object };
  yarnLock: string;
};

export const getLayerDependencies = async (
  layerVersion: number | 'latest',
): Promise<LayerDependencies> => {
  const lastVersionLayerDirName = getLayerDependenciesDirName(layerVersion);
  const [packageJson, yarnLock] = await Promise.all([
    fs.readFile(join(lastVersionLayerDirName, 'package.json'), 'utf8'),
    fs.readFile(join(lastVersionLayerDirName, 'yarn.lock'), 'utf8'),
  ]);

  return { packageJson: JSON.parse(packageJson), yarnLock };
};
