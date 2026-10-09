import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

import { hashContent } from '@/utils/hash-content';
import { hasErrorCode } from '@/utils/has-error-code';

export const readGeneratedClientStamp = async (
  packageRoot: string,
): Promise<string> => {
  const readFileHash = async (path: string): Promise<string | null> => {
    try {
      return hashContent(await readFile(path));
    } catch (error) {
      if (hasErrorCode(error, 'ENOENT')) return null;
      throw error;
    }
  };
  const paths = ['dist/core.mjs', 'dist/core.cjs'];
  const generatedDirectory = join(packageRoot, 'dist/core/generated');

  try {
    const entries = await readdir(generatedDirectory, {
      recursive: true,
      withFileTypes: true,
    });

    for (const entry of entries) {
      if (entry.isFile() || entry.isSymbolicLink()) {
        paths.push(relative(packageRoot, join(entry.parentPath, entry.name)));
      }
    }
  } catch (error) {
    if (!hasErrorCode(error, 'ENOENT')) throw error;
  }

  return JSON.stringify(
    await Promise.all(
      paths
        .sort()
        .map(async (path) => [
          path,
          await readFileHash(join(packageRoot, path)),
        ]),
    ),
  );
};
