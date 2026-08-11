import { rm } from 'node:fs/promises';
import { join } from 'path';

import { OUTPUT_DIR } from 'twenty-shared/application';

export const removeBuiltSharedDependenciesBundle = async ({
  appPath,
  builtPath,
}: {
  appPath: string;
  builtPath: string;
}): Promise<void> => {
  const absoluteBuiltPath = join(appPath, OUTPUT_DIR, builtPath);

  await rm(absoluteBuiltPath, { force: true });
  await rm(`${absoluteBuiltPath}.map`, { force: true });
};
