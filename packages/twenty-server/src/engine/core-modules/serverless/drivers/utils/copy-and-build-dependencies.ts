import { execFile } from 'child_process';
import { promises as fs, statSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

import { getLayerDependenciesDirName } from 'src/engine/core-modules/serverless/drivers/utils/get-layer-dependencies-dir-name';
import type { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

const execFilePromise = promisify(execFile);

export const copyAndBuildDependencies = async (
  buildDirectory: string,
  serverlessFunction: ServerlessFunctionEntity,
) => {
  await fs.mkdir(buildDirectory, {
    recursive: true,
  });

  const packageJson = serverlessFunction.serverlessFunctionLayer.packageJson;

  const yarnLock = serverlessFunction.serverlessFunctionLayer.yarnLock;

  await fs.writeFile(
    join(buildDirectory, 'package.json'),
    JSON.stringify(packageJson, null, 2),
    'utf8',
  );

  await fs.writeFile(join(buildDirectory, 'yarn.lock'), yarnLock, 'utf8');

  await fs.cp(getLayerDependenciesDirName('engine'), buildDirectory, {
    recursive: true,
  });

  const localYarnPath = join(buildDirectory, '.yarn/releases/yarn-4.9.2.cjs');

  try {
    await execFilePromise(process.execPath, [localYarnPath], {
      cwd: buildDirectory,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    const errorMessage =
      [error?.stdout, error?.stderr].filter(Boolean).join('\n') ||
      'Failed to install serverless dependencies';

    throw new Error(errorMessage);
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
