import { promises as fs } from 'fs';
import { join } from 'path';

import { COMMON_LAYER_DEPENDENCIES_DIRNAME } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/common-layer-dependencies-dirname';
import { copyYarnEngineAndBuildDependencies } from 'src/engine/core-modules/application/application-package/utils/copy-yarn-engine-and-build-dependencies';

// Builds a Lambda layer with the common dependencies (e.g. archiver)
// by copying the package.json + yarn.lock, then running yarn install locally.
// The result follows the Lambda layer structure: nodejs/node_modules/...
export const copyCommonLayerDependencies = async (
  buildDirectory: string,
): Promise<void> => {
  const nodejsDir = join(buildDirectory, 'nodejs');

  await fs.mkdir(nodejsDir, { recursive: true });

  await fs.cp(COMMON_LAYER_DEPENDENCIES_DIRNAME, nodejsDir, {
    recursive: true,
  });

  await copyYarnEngineAndBuildDependencies(nodejsDir);
};
