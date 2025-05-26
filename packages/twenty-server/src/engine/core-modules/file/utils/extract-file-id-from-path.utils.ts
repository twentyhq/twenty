import { isNonEmptyString } from '@sniptt/guards';

export const extractFileIdFromPath = (path: string) => {
  if (path.includes('/') && path.slice(-1) === '/') {
    throw new Error(`Cannot extract id from folder path '${path}'`);
  }

  const fileId = path.split('/').reverse()[0];

  if (!isNonEmptyString(fileId)) {
    throw new Error(`Cannot extract id from empty path`);
  }

  return fileId;
};
