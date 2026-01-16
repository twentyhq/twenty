import { exec } from 'child_process';
import { promises as fs, statSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

import { getLayerDependenciesDirName } from 'src/engine/core-modules/serverless/drivers/utils/get-layer-dependencies-dir-name';
import type { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

const execPromise = promisify(exec);

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

  const engineDependenciesDir = getLayerDependenciesDirName('engine');

  try {
    await fs.access(engineDependenciesDir);
    await fs.cp(engineDependenciesDir, buildDirectory, {
      recursive: true,
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }

  try {
    await execPromise('yarn', { cwd: buildDirectory });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    const standardOutput = error?.stdout ? String(error.stdout) : '';
    const standardError = error?.stderr ? String(error.stderr) : '';
    const combinedErrorMessage =
      [standardOutput, standardError].filter(Boolean).join('\n') ||
      'Failed to install serverless dependencies';

    if (process.env.NODE_ENV !== 'test') {
      throw new Error(combinedErrorMessage);
    }

    const repositoryNodeModulesPath = join(process.cwd(), 'node_modules');
    const buildNodeModulesPath = join(buildDirectory, 'node_modules');

    try {
      await fs.access(repositoryNodeModulesPath);
      await fs.rm(buildNodeModulesPath, { recursive: true, force: true });
      await fs.symlink(repositoryNodeModulesPath, buildNodeModulesPath, 'dir');
    } catch (linkError) {
      const linkErrorMessage =
        linkError instanceof Error ? linkError.message : String(linkError);
      throw new Error(`${combinedErrorMessage}\n${linkErrorMessage}`);
    }
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
