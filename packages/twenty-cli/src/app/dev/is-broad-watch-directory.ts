import { realpathSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { parse, resolve } from 'node:path';

import { hasErrorCode } from '@/utils/has-error-code';
import { isInsideDirectory } from '@/utils/is-inside-directory';

const canonicalPath = (path: string) => {
  try {
    return realpathSync(path);
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT') || hasErrorCode(error, 'ENOTDIR')) {
      return resolve(path);
    }

    throw error;
  }
};

export const isBroadWatchDirectory = (path: string) => {
  const directory = canonicalPath(path);

  if (parse(directory).root === directory) {
    return true;
  }

  return [
    homedir(),
    tmpdir(),
    ...(process.platform === 'win32' ? [] : ['/tmp']),
  ]
    .map(canonicalPath)
    .some(
      (boundary) =>
        directory === boundary ||
        isInsideDirectory({ filePath: boundary, directory }),
    );
};
