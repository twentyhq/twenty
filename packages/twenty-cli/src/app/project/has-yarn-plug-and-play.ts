import { access } from 'node:fs/promises';
import { join } from 'node:path';

import { listAncestorDirectories } from '@/app/project/list-ancestor-directories';

export const hasYarnPlugAndPlay = async (appPath: string) => {
  for (const directory of listAncestorDirectories(appPath)) {
    const hasLoader = await access(join(directory, '.pnp.cjs')).then(
      () => true,
      () => false,
    );

    if (hasLoader) {
      return true;
    }
  }

  return false;
};
