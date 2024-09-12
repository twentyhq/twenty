import { statSync, promises as fs } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import { join } from 'path';

import { getLayerDependenciesDirName } from 'src/engine/core-modules/serverless/drivers/utils/get-layer-dependencies-dir-name';

const execPromise = promisify(exec);

export const copyAndBuildDependencies = async (buildDirectory: string) => {
  await fs.mkdir(buildDirectory, {
    recursive: true,
  });

  await fs.cp(getLayerDependenciesDirName('latest'), buildDirectory, {
    recursive: true,
  });
  await fs.cp(getLayerDependenciesDirName('engine'), buildDirectory, {
    recursive: true,
  });

  try {
    await execPromise('yarn', { cwd: buildDirectory });
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
