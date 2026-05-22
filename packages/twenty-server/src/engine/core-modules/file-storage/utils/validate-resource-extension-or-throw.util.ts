import { type FileFolder } from 'twenty-shared/types';

import { ALLOWED_EXTENSIONS_BY_APPLICATION_FILE_FOLDER } from 'src/engine/core-modules/file-storage/constants/allowed-extensions-by-application-file-folder.constant';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { hasAllowedExtension } from 'src/engine/core-modules/file-storage/utils/has-allowed-extension.util';

export const validateResourceExtensionOrThrow = (
  resourcePath: string,
  fileFolder: FileFolder,
): void => {
  const allowedExtensions =
    ALLOWED_EXTENSIONS_BY_APPLICATION_FILE_FOLDER[
      fileFolder as keyof typeof ALLOWED_EXTENSIONS_BY_APPLICATION_FILE_FOLDER
    ];

  if (!allowedExtensions) {
    return;
  }

  if (!hasAllowedExtension(resourcePath, allowedExtensions)) {
    throw new FileStorageException(
      `Invalid file extension for ${fileFolder}. Allowed extensions: ${Object.keys(allowedExtensions).join(', ')}`,
      FileStorageExceptionCode.INVALID_EXTENSION,
    );
  }
};
