import { promises as fs, statSync } from 'fs';
import { join } from 'path';

import { YARN_ENGINE_DIRNAME } from 'src/engine/core-modules/application/application-package/constants/yarn-engine-dirname';
import { installYarnDependencies } from 'src/engine/core-modules/application/application-package/constants/yarn-engine/install-yarn-dependencies.cjs';

export const copyYarnEngineAndBuildDependencies = async (
  buildDirectory: string,
) => {
  await fs.mkdir(buildDirectory, {
    recursive: true,
  });

  try {
    await installYarnDependencies({
      directory: buildDirectory,
      yarnEngineDirectory: YARN_ENGINE_DIRNAME,
      args: ['workspaces', 'focus', '--all', '--production'],
    });
    // oxlint-disable-next-line typescript/no-explicit-any
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
