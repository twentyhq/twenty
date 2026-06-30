import { isAbsolute, normalize, sep } from 'path';

export const isSafeRelativePath = (filePath: string): boolean => {
  if (filePath.length === 0) {
    return false;
  }

  if (filePath.includes('\0')) {
    return false;
  }

  if (isAbsolute(filePath)) {
    return false;
  }

  if (filePath.includes('\\')) {
    return false;
  }

  const normalized = normalize(filePath);

  if (normalized.split(sep).includes('..')) {
    return false;
  }

  return true;
};
