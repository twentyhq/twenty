import { type MessageDescriptor } from '@lingui/core';

import { CustomException } from 'src/utils/custom-exception';

export enum FilesFieldExceptionCode {
  FILE_DELETION_FAILED = 'FILE_DELETION_FAILED',
  TEMPORARY_FILE_NOT_ALLOWED = 'TEMPORARY_FILE_NOT_ALLOWED',
}

export class FilesFieldException extends CustomException<FilesFieldExceptionCode> {
  constructor(
    message: string,
    code: FilesFieldExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage: MessageDescriptor },
  ) {
    super(message, code, {
      userFriendlyMessage,
    });
  }
}
