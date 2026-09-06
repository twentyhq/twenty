import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import bytes from 'bytes';
import { isDefined } from 'twenty-shared/utils';

import { settings } from 'src/engine/constants/settings';
import {
  FileUploadException,
  FileUploadExceptionCode,
} from 'src/engine/core-modules/file/file-upload/file-upload.exception';

const DATA_URL_BASE64_PREFIX = /^data:[^;]*;base64,/i;
const BASE64_PAYLOAD = /^[A-Za-z0-9+/]*={0,2}$/;

const getMaxInMemoryFileSizeBytes = (): number => {
  const maxFileSizeBytes = bytes(settings.storage.maxFileSize);

  if (!isDefined(maxFileSizeBytes) || maxFileSizeBytes <= 0) {
    throw new Error(
      `Invalid settings.storage.maxFileSize: ${settings.storage.maxFileSize}`,
    );
  }

  return maxFileSizeBytes;
};

export const decodeBase64FileContentOrThrow = (
  content: string,
  maxFileSizeBytes = getMaxInMemoryFileSizeBytes(),
): Buffer => {
  const strippedContent = content
    .trim()
    .replace(DATA_URL_BASE64_PREFIX, '')
    .replace(/\s/g, '');

  if (
    !isNonEmptyString(strippedContent) ||
    !BASE64_PAYLOAD.test(strippedContent)
  ) {
    throw new FileUploadException(
      'File content must be valid base64.',
      FileUploadExceptionCode.BAD_REQUEST,
      {
        userFriendlyMessage: msg`File content must be valid base64.`,
      },
    );
  }

  const estimatedDecodedSize = Math.floor((strippedContent.length * 3) / 4);

  if (estimatedDecodedSize > maxFileSizeBytes) {
    throw new FileUploadException(
      `Invalid file size ${estimatedDecodedSize} (max ${maxFileSizeBytes} bytes)`,
      FileUploadExceptionCode.FILE_TOO_LARGE,
      {
        userFriendlyMessage: msg`The file is empty or exceeds the maximum allowed size.`,
      },
    );
  }

  const buffer = Buffer.from(strippedContent, 'base64');

  if (buffer.length === 0 || buffer.length > maxFileSizeBytes) {
    throw new FileUploadException(
      `Invalid file size ${buffer.length} (max ${maxFileSizeBytes} bytes)`,
      FileUploadExceptionCode.FILE_TOO_LARGE,
      {
        userFriendlyMessage: msg`The file is empty or exceeds the maximum allowed size.`,
      },
    );
  }

  return buffer;
};
