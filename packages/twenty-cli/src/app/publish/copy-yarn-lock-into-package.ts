import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { APPLICATION_PACKAGE_YARN_LOCK_PATH } from 'twenty-shared/application';

import { type ToolingBuild } from '@/app/types/tooling-result.type';

export const copyYarnLockIntoPackage = async ({
  snapshotDirectory,
  build,
}: {
  snapshotDirectory: string;
  build: ToolingBuild;
}): Promise<string | undefined> => {
  if (!build.files.some((file) => file.path === 'yarn.lock')) {
    return undefined;
  }

  const packagedYarnLockPath = join(
    snapshotDirectory,
    APPLICATION_PACKAGE_YARN_LOCK_PATH,
  );

  await mkdir(dirname(packagedYarnLockPath), { recursive: true });
  await copyFile(join(snapshotDirectory, 'yarn.lock'), packagedYarnLockPath);

  return APPLICATION_PACKAGE_YARN_LOCK_PATH;
};
