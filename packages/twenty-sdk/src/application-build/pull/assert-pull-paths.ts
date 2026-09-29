import { lstat } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';

export const assertPullPaths = async (
  appPath: string,
  relativePaths: string[],
): Promise<void> => {
  for (const relativePath of relativePaths) {
    const containedPath = relative(appPath, resolve(appPath, relativePath));

    if (
      containedPath.length === 0 ||
      containedPath === '..' ||
      containedPath.startsWith(`..${sep}`) ||
      isAbsolute(containedPath)
    ) {
      throw new Error(
        `Pull path leaves the application directory: ${relativePath}`,
      );
    }

    let currentPath = appPath;

    for (const part of containedPath.split(sep)) {
      currentPath = resolve(currentPath, part);

      try {
        if ((await lstat(currentPath)).isSymbolicLink()) {
          throw new Error(
            `Pull does not follow symbolic links: ${relativePath}`,
          );
        }
      } catch (error) {
        if (
          error instanceof Error &&
          'code' in error &&
          error.code === 'ENOENT'
        ) {
          break;
        }
        throw error;
      }
    }
  }
};
