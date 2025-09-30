import { statSync, promises as fs } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import { join } from 'path';

import { isDefined } from 'twenty-shared/utils';

import { getLayerDependenciesDirName } from 'src/engine/core-modules/serverless/drivers/utils/get-layer-dependencies-dir-name';
import type { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { LAST_LAYER_VERSION } from 'src/engine/core-modules/serverless/drivers/layers/last-layer-version';

const execPromise = promisify(exec);

export const copyAndBuildDependencies = async (
  buildDirectory: string,
  serverlessFunction: ServerlessFunctionEntity,
) => {
  await fs.mkdir(buildDirectory, {
    recursive: true,
  });

  if (!isDefined(serverlessFunction.serverlessFunctionLayer)) {
    await fs.cp(
      getLayerDependenciesDirName(
        serverlessFunction.layerVersion || LAST_LAYER_VERSION,
      ),
      buildDirectory,
      {
        recursive: true,
      },
    );
  } else {
    const packageJson = serverlessFunction.serverlessFunctionLayer.packageJson;

    const yarnLock = serverlessFunction.serverlessFunctionLayer.yarnLock;

    await fs.writeFile(
      join(buildDirectory, 'package.json'),
      JSON.stringify(packageJson, null, 2),
      'utf8',
    );

    await fs.writeFile(join(buildDirectory, 'yarn.lock'), yarnLock, 'utf8');
  }

  await fs.cp(getLayerDependenciesDirName('engine'), buildDirectory, {
    recursive: true,
  });

  try {
    await execPromise('yarn', { cwd: buildDirectory });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(error.stdout);
  }
  const objects = await fs.readdir(buildDirectory);

  objects.forEach((object) => {
    const fullPath = join(buildDirectory, object);

    if (object === 'node_modules') return;

    if (statSync(fullPath).isDirectory()) {
      fs.rm(fullPath, { recursive: true, force: true });
    } else {
      fs.rm(fullPath);
    }
  });
};
