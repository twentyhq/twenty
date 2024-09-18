import fs from 'fs/promises';
import { join } from 'path';

import { getLayerDependenciesDirName } from 'src/engine/core-modules/serverless/drivers/utils/get-layer-dependencies-dir-name';

export type LayerDependencies = {
  packageJson: { dependencies: object };
  yarnLock: string;
};

export const getLastLayerDependencies =
  async (): Promise<LayerDependencies> => {
    const lastVersionLayerDirName = getLayerDependenciesDirName('latest');
    const packageJson = await fs.readFile(
      join(lastVersionLayerDirName, 'package.json'),
      'utf8',
    );
    const yarnLock = await fs.readFile(
      join(lastVersionLayerDirName, 'yarn.lock'),
      'utf8',
    );

    return { packageJson: JSON.parse(packageJson), yarnLock };
  };
