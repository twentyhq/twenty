import path from 'path';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

export const assertStoragePathIsSafe = (storagePath: string): void => {
  if (storagePath.includes('\0')) {
    throw new FileStorageException(
      'Invalid storage path: contains null bytes',
      FileStorageExceptionCode.ACCESS_DENIED,
    );
  }

  if (path.isAbsolute(storagePath)) {
    throw new FileStorageException(
      'Invalid storage path: absolute path not allowed',
      FileStorageExceptionCode.ACCESS_DENIED,
    );
  }

  const normalized = path.normalize(storagePath);

  if (normalized.split(path.sep).includes('..')) {
    throw new FileStorageException(
      'Invalid storage path: path traversal detected',
      FileStorageExceptionCode.ACCESS_DENIED,
    );
  }
};
