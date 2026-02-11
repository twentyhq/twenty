import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum FileStorageExceptionCode {
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  ACCESS_DENIED = 'ACCESS_DENIED',
  INVALID_EXTENSION = 'INVALID_EXTENSION',
}

const getFileStorageExceptionUserFriendlyMessage = (
  code: FileStorageExceptionCode,
) => {
  switch (code) {
    case FileStorageExceptionCode.INVALID_EXTENSION:
      return msg`Wrong extension for file.`;
    case FileStorageExceptionCode.FILE_NOT_FOUND:
      return msg`File not found.`;
    case FileStorageExceptionCode.ACCESS_DENIED:
      return msg`Access denied.`;
    default:
      assertUnreachable(code);
  }
};

export class FileStorageException extends CustomException<FileStorageExceptionCode> {
  constructor(
    message: string,
    code: FileStorageExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getFileStorageExceptionUserFriendlyMessage(code),
    });
  }
}
