import { access } from 'node:fs/promises';
import { join } from 'node:path';

import { listAncestorDirectories } from '@/app/project/list-ancestor-directories';

export const hasYarnPlugAndPlay = async (appPath: string) => {
  for (const directory of listAncestorDirectories(appPath)) {
    const hasLoader = (
      await Promise.all(
        ['.pnp.cjs', '.pnp.js'].map((fileName) =>
          access(join(directory, fileName)).then(
            () => true,
            () => false,
          ),
        ),
      )
    ).some(Boolean);

    if (hasLoader) {
      return true;
    }
  }

  return false;
};
