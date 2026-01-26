import * as fs from 'fs-extra';
import path from 'path';

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

    await fs.remove(outputFile);
    await fs.remove(sourceMapFile);
  }
};
