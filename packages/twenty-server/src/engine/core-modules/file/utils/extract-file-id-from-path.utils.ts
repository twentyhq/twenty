import { isNonEmptyString } from '@sniptt/guards';

export const extractFileIdFromPath = (path: string) => {
  if (path.endsWith('/')) {
    throw new Error(`Cannot extract id from folder path '${path}'`);
  }

  const fileId = path.split('/').pop();

  if (!isNonEmptyString(fileId)) {
    throw new Error(`Cannot extract id from empty path`);
  }

  return fileId;
};
