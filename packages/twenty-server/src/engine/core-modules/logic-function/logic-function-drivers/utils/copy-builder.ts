import { promises as fs } from 'fs';
import { resolve, join } from 'path';

import { ASSET_PATH } from 'src/constants/assets-path';
import { YARN_ENGINE_DIRNAME } from 'src/engine/core-modules/application/application-package/constants/yarn-engine-dirname';

const BUILDER_FILE_PATH = resolve(
  __dirname,
  join(
    ASSET_PATH,
    'engine/core-modules/logic-function/logic-function-drivers/constants/builder',
  ),
);

export const copyBuilder = async (buildDirectory: string) => {
  await fs.mkdir(buildDirectory, { recursive: true });

  await fs.cp(BUILDER_FILE_PATH, buildDirectory, { recursive: true });

  // Bundle the yarn engine alongside the handler so the builder Lambda
  // can copy it into /tmp at runtime without external dependencies.
  const yarnEngineDestination = join(buildDirectory, 'yarn-engine');

  await fs.cp(YARN_ENGINE_DIRNAME, yarnEngineDestination, { recursive: true });
};
