import { statSync, promises as fs } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import { join } from 'path';

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

  await fs.cp(getLayerDependenciesDirName('engine'), buildDirectory, {
    recursive: true,
  });

  const yarnrcPath = join(buildDirectory, '.yarnrc.yml');
  let yarnCommand = 'yarn';

  try {
    const yarnrc = await fs.readFile(yarnrcPath, 'utf8');
    const match = yarnrc.match(/yarnPath:\s*(.+)/);

    if (match) {
      const yarnPath = match[1].trim();
      yarnCommand = `${process.execPath} ${join(buildDirectory, yarnPath)}`;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }

  try {
    await execPromise(yarnCommand, { cwd: buildDirectory });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    const standardOutput = error?.stdout ? String(error.stdout) : '';
    const standardError = error?.stderr ? String(error.stderr) : '';
    const combinedErrorMessage =
      [standardOutput, standardError].filter(Boolean).join('\n') ||
      'Failed to install serverless dependencies';

    throw new Error(combinedErrorMessage);
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
