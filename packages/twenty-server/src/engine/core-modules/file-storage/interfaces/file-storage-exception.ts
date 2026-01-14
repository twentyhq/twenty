import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum FileStorageExceptionCode {
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
}

const getFileStorageExceptionUserFriendlyMessage = (
  code: FileStorageExceptionCode,
) => {
  switch (code) {
    case FileStorageExceptionCode.FILE_NOT_FOUND:
      return msg`File not found.`;
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
