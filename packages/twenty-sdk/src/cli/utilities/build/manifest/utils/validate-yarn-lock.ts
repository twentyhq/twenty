import { pathExists } from '@/cli/utilities/file/fs-utils';
import { stat } from 'node:fs/promises';
import path from 'path';

export const validateYarnLockFile = async (
  yarnLockPath: string,
): Promise<string[]> => {
  if (!(await pathExists(yarnLockPath))) {
    return [];
  }

  return (await stat(yarnLockPath)).size === 0
    ? [
        'yarn.lock is empty. Run "yarn install" to regenerate it before building.',
      ]
    : [];
};

export const validateYarnLock = (appPath: string): Promise<string[]> =>
  validateYarnLockFile(path.join(appPath, 'yarn.lock'));
