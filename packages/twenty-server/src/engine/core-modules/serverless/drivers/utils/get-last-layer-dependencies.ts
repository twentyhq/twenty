import fs from 'fs/promises';
import { join } from 'path';

import { isDefined } from 'twenty-shared/utils';

import { getLayerDependenciesDirName } from 'src/engine/core-modules/serverless/drivers/utils/get-layer-dependencies-dir-name';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { LAST_LAYER_VERSION } from 'src/engine/core-modules/serverless/drivers/layers/last-layer-version';
import { type PackageJson } from 'src/engine/core-modules/application/types/application.types';

export type LayerDependencies = {
  packageJson: PackageJson;
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

  return { packageJson: JSON.parse(packageJson), yarnLock };
};

export const getLayerDependencies = async (
  serverlessFunction: ServerlessFunctionEntity,
): Promise<LayerDependencies> => {
  if (!isDefined(serverlessFunction.serverlessFunctionLayer)) {
    return getLastCommonLayerDependencies(
      serverlessFunction.layerVersion ?? undefined,
    );
  }

  return {
    packageJson: serverlessFunction.serverlessFunctionLayer.packageJson,
    yarnLock: serverlessFunction.serverlessFunctionLayer.yarnLock,
  };
};
