import { msg } from '@lingui/core/macro';

import {
  FileUploadException,
  FileUploadExceptionCode,
} from 'src/engine/core-modules/file/file-upload/file-upload.exception';

export const buildSvgTooLargeException = (
  detail: string,
): FileUploadException =>
  new FileUploadException(
    `SVG cannot be sanitized: ${detail}`,
    FileUploadExceptionCode.FILE_TOO_LARGE,
    {
      userFriendlyMessage: msg`This SVG is too large to be processed.`,
    },
  );
