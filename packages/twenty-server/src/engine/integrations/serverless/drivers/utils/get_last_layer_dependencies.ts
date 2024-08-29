import fs from 'fs/promises';
import path, { join } from 'path';

import { LAST_LAYER_VERSION } from 'src/engine/integrations/serverless/drivers/constants/last_layer_version';

export type LayerDependencies = {
  packageJson: { dependencies: object };
  yarnLock: string;
};

export const get_last_layer_dependencies =
  async (): Promise<LayerDependencies> => {
    const lastVersionLayerDirName = path.resolve(
      __dirname,
      `../constants/layers/${LAST_LAYER_VERSION}`,
    );
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
