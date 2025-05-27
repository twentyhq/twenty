import { basename } from 'path';

import { isNonEmptyString } from '@sniptt/guards';

export const extractFilenameFromPath = (path: string) => {
  if (path.endsWith('/')) {
    throw new Error(`Cannot extract filename from folder path '${path}'`);
  }

  const filename = basename(path);

  const sanitizedFileName = filename.replace(/\?token=[^&]*/, '');

  if (!isNonEmptyString(sanitizedFileName)) {
    throw new Error(`Cannot extract filename from empty path`);
  }

  return sanitizedFileName;
};
