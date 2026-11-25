import { promises as fs, statSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

import { YARN_ENGINE_DIRNAME } from 'src/engine/core-modules/application/application-package/constants/yarn-engine-dirname';
import { installYarnDependencies } from 'src/engine/core-modules/application/application-package/constants/yarn-engine/install-yarn-dependencies.cjs';

const installErrorOutputSchema = z.object({
  stdout: z.string().optional(),
  stderr: z.string().optional(),
});

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
  } catch (error: unknown) {
    const parsedError = installErrorOutputSchema.safeParse(error);
    const errorMessage =
      (parsedError.success
        ? [parsedError.data.stdout, parsedError.data.stderr]
            .filter(Boolean)
            .join('\n')
        : '') || 'Failed to install logic function executor dependencies';

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
