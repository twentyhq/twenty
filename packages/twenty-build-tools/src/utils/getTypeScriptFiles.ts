import { globSync } from 'glob';
import path from 'path';
import slash from 'slash';

import { EXCLUDED_DIRECTORIES } from '../constants/ExcludedDirectories';
import { EXCLUDED_EXTENSIONS } from '../constants/ExcludedExtensions';

export const getTypeScriptFiles = (
  directoryPath: string,
  srcPath: string,
  includeIndex: boolean = false,
): string[] => {
  const pattern = slash(path.join(directoryPath, '**', '*.{ts,tsx}'));

  const files = globSync(pattern, {
    cwd: srcPath,
    nodir: true,
    ignore: [...EXCLUDED_EXTENSIONS, ...EXCLUDED_DIRECTORIES],
  });

  return files.filter(
    (file) =>
      !file.endsWith('.d.ts') &&
      (includeIndex ? true : !file.endsWith('index.ts')),
  );
};
