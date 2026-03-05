import path from 'path';

import { remove } from '@/cli/utilities/file/fs-utils';

export const cleanupRemovedFiles = async (
  outputDir: string,
  oldPaths: string[],
  newPaths: string[],
): Promise<void> => {
  const newPathsSet = new Set(newPaths);
  const removedPaths = oldPaths.filter((p) => !newPathsSet.has(p));

  for (const removedPath of removedPaths) {
    const outputBaseName = removedPath.replace(/\.tsx?$/, '.mjs');
    const outputFile = path.join(outputDir, outputBaseName);
    const sourceMapFile = `${outputFile}.map`;

    await remove(outputFile);
    await remove(sourceMapFile);
  }
};
