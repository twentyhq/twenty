import { join, normalize } from 'path';

import { type InstanceFileFolder } from 'twenty-shared/types';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { assertStoragePathIsSafe } from 'src/engine/core-modules/file-storage/utils/assert-storage-path-is-safe.util';
import { INSTANCE_FILE_STORAGE_PREFIX } from 'src/engine/core-modules/file-storage/constants/instance-file-storage-prefix.constant';

export const validateStoragePathIsWithinInstanceScopeOrThrow = ({
  onStoragePath,
  fileFolder,
}: {
  onStoragePath: string;
  fileFolder: InstanceFileFolder;
}): void => {
  assertStoragePathIsSafe(onStoragePath);

  const expectedPrefix = join(INSTANCE_FILE_STORAGE_PREFIX, fileFolder);

  const normalizedPath = normalize(onStoragePath);
  const normalizedPrefix = normalize(expectedPrefix + '/');

  if (!normalizedPath.startsWith(normalizedPrefix)) {
    throw new FileStorageException(
      'Invalid storage path: resolved path escapes the instance scope',
      FileStorageExceptionCode.ACCESS_DENIED,
    );
  }
};
