import { execFile } from 'child_process';
import { promises as fs, statSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

import { getLayerDependenciesDirName } from 'src/engine/core-modules/logic-function-executor/drivers/utils/get-layer-dependencies-dir-name';
import { type FlatLogicFunctionLayer } from 'src/engine/metadata-modules/logic-function-layer/types/flat-logic-function-layer.type';

const execFilePromise = promisify(execFile);

export const copyAndBuildDependencies = async (
  buildDirectory: string,
  flatLogicFunctionLayer: FlatLogicFunctionLayer,
) => {
  await fs.mkdir(buildDirectory, {
    recursive: true,
  });

  const packageJson = flatLogicFunctionLayer.packageJson;

  const yarnLock = flatLogicFunctionLayer.yarnLock;

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

  // Strip NODE_OPTIONS to prevent tsx loader from interfering with yarn
  const { NODE_OPTIONS: _nodeOptions, ...cleanEnv } = process.env;

  try {
    await execFilePromise(process.execPath, [localYarnPath], {
      cwd: buildDirectory,
      env: cleanEnv,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    const errorMessage =
      [error?.stdout, error?.stderr].filter(Boolean).join('\n') ||
      'Failed to install logic function executor dependencies';

    throw new Error(errorMessage);
  }
  const objects = await fs.readdir(buildDirectory);

  await Promise.all(
    objects
      .filter((object) => object !== 'node_modules')
      .map((object) => {
        const fullPath = join(buildDirectory, object);

        return statSync(fullPath).isDirectory()
          ? fs.rm(fullPath, { recursive: true, force: true })
          : fs.rm(fullPath);
      }),
  );
};
