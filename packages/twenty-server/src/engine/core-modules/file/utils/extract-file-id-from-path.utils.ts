import { basename } from 'path';

import { isNonEmptyString } from '@sniptt/guards';

export const extractFilenameFromPath = (path: string) => {
  if (path.endsWith('/')) {
    throw new Error(`Cannot extract id from folder path '${path}'`);
  }

  const fileId = basename(path);

  if (!isNonEmptyString(fileId)) {
    throw new Error(`Cannot extract id from empty path`);
  }

  return fileId;
};
