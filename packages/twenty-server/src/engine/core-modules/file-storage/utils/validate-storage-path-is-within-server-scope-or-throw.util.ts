import { join, normalize } from 'path';

import { type ServerFileFolder } from 'twenty-shared/types';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { assertStoragePathIsSafe } from 'src/engine/core-modules/file-storage/utils/assert-storage-path-is-safe.util';
import { SERVER_FILE_STORAGE_PREFIX } from 'src/engine/core-modules/file-storage/constants/server-file-storage-prefix.constant';

export const validateStoragePathIsWithinServerScopeOrThrow = ({
  onStoragePath,
  fileFolder,
}: {
  onStoragePath: string;
  fileFolder: ServerFileFolder;
}): void => {
  assertStoragePathIsSafe(onStoragePath);

  const expectedPrefix = join(SERVER_FILE_STORAGE_PREFIX, fileFolder);

  const normalizedPath = normalize(onStoragePath);
  const normalizedPrefix = normalize(expectedPrefix + '/');

  if (!normalizedPath.startsWith(normalizedPrefix)) {
    throw new FileStorageException(
      'Invalid storage path: resolved path escapes the server scope',
      FileStorageExceptionCode.ACCESS_DENIED,
    );
  }
};
