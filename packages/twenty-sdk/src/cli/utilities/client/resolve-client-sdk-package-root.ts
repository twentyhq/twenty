import { dirname, join, resolve } from 'path';

import { pathExists } from '@/cli/utilities/file/fs-utils';

// Walks up from startPath so hoisted workspace installs (where the package
// lands in the repository root node_modules) are found.
export const resolveClientSdkPackageRoot = async (
  startPath: string,
): Promise<string | undefined> => {
  let currentPath = resolve(startPath);

  while (true) {
    const candidatePath = join(
      currentPath,
      'node_modules',
      'twenty-client-sdk',
    );

    if (await pathExists(candidatePath)) {
      return candidatePath;
    }

    const parentPath = dirname(currentPath);

    if (parentPath === currentPath) {
      return undefined;
    }

    currentPath = parentPath;
  }
};
