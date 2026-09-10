import { msg } from '@lingui/core/macro';
import bytes from 'bytes';

import { settings } from 'src/engine/constants/settings';
import {
  FileUploadException,
  FileUploadExceptionCode,
} from 'src/engine/core-modules/file/file-upload/file-upload.exception';

export const assertDirectUploadSizeOrThrow = (size: number): void => {
  const maxFileSize = bytes(settings.storage.maxDirectUploadFileSize) ?? 0;

  if (!Number.isInteger(size) || size <= 0 || size > maxFileSize) {
    throw new FileUploadException(
      `Invalid file size ${size} (max ${maxFileSize} bytes)`,
      FileUploadExceptionCode.FILE_TOO_LARGE,
      {
        userFriendlyMessage: msg`The file is empty or exceeds the maximum allowed size.`,
      },
    );
  }
};
