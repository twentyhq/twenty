import { globSync } from 'glob';
import path from 'path';
import slash from 'slash';

import { EXCLUDED_DIRECTORIES } from '../constants/ExcludedDirectories';

export const getSubDirectoryPaths = (
  directoryPath: string,
  srcPath: string,
): string[] => {
  const pattern = slash(path.join(directoryPath, '*/'));

  return globSync(pattern, {
    ignore: [...EXCLUDED_DIRECTORIES],
    cwd: srcPath,
    nodir: false,
    maxDepth: 1,
  }).sort((left, right) => left.localeCompare(right));
};
