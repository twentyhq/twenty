import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { isSafeRelativePath } from 'src/engine/core-modules/file-storage/utils/is-safe-relative-path.util';

export const validateResourcePathOrThrow = ({
  resourcePath,
}: {
  resourcePath: string;
}): void => {
  if (!isSafeRelativePath(resourcePath)) {
    throw new FileStorageException(
      'Invalid resource path: contains unsafe characters or path traversal',
      FileStorageExceptionCode.ACCESS_DENIED,
    );
  }
};
