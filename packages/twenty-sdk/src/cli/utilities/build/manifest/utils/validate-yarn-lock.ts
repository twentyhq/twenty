import { pathExists } from '@/cli/utilities/file/fs-utils';
import { stat } from 'node:fs/promises';
import path from 'path';

export const validateYarnLock = async (appPath: string): Promise<string[]> => {
  const yarnLockPath = path.join(appPath, 'yarn.lock');

  if (!(await pathExists(yarnLockPath))) {
    return [];
  }

  return (await stat(yarnLockPath)).size === 0
    ? [
        'yarn.lock is empty. Run "yarn install" to regenerate it before building.',
      ]
    : [];
};
