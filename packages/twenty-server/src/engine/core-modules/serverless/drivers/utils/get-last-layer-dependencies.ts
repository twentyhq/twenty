import fs from 'fs/promises';
import { join } from 'path';

import { isDefined } from 'twenty-shared/utils';

import { getLayerDependenciesDirName } from 'src/engine/core-modules/serverless/drivers/utils/get-layer-dependencies-dir-name';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { LAST_LAYER_VERSION } from 'src/engine/core-modules/serverless/drivers/layers/last-layer-version';

export type LayerDependencies = {
  packageJson: { dependencies?: object };
  yarnLock: string;
};

export const getLayerDependencies = async (
  serverlessFunction: ServerlessFunctionEntity,
): Promise<LayerDependencies> => {
  if (!isDefined(serverlessFunction.application)) {
    const lastVersionLayerDirName = getLayerDependenciesDirName(
      serverlessFunction.layerVersion || LAST_LAYER_VERSION,
    );
    const [packageJson, yarnLock] = await Promise.all([
      fs.readFile(join(lastVersionLayerDirName, 'package.json'), 'utf8'),
      fs.readFile(join(lastVersionLayerDirName, 'yarn.lock'), 'utf8'),
    ]);

    return { packageJson: JSON.parse(packageJson), yarnLock };
  }

  return {
    packageJson:
      serverlessFunction.application.serverlessFunctionLayer.packageJson,
    yarnLock: serverlessFunction.application.serverlessFunctionLayer.yarnLock,
  };
};
