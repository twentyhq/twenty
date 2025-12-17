import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum FileStorageExceptionCode {
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
}

const fileStorageExceptionUserFriendlyMessages: Record<
  FileStorageExceptionCode,
  MessageDescriptor
> = {
  [FileStorageExceptionCode.FILE_NOT_FOUND]: msg`File not found.`,
};

export class FileStorageException extends CustomException<FileStorageExceptionCode> {
  constructor(
    message: string,
    code: FileStorageExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? fileStorageExceptionUserFriendlyMessages[code],
    });
  }
}
