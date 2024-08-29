import { promises as fs } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

import { getLayerDependenciesDirName } from 'src/engine/integrations/serverless/drivers/utils/get-layer-dependencies-dir-name';

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
};
