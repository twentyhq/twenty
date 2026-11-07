import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { APPLICATION_PACKAGE_YARN_LOCK_PATH } from 'twenty-shared/application';

export const copyYarnLockIntoPackage = async (
  snapshotDirectory: string,
): Promise<void> => {
  const packagedYarnLockPath = join(
    snapshotDirectory,
    APPLICATION_PACKAGE_YARN_LOCK_PATH,
  );

  await mkdir(dirname(packagedYarnLockPath), { recursive: true });
  await copyFile(join(snapshotDirectory, 'yarn.lock'), packagedYarnLockPath);
};
