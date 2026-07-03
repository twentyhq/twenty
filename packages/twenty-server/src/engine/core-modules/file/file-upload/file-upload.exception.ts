import { type MessageDescriptor } from '@lingui/core';

import { CustomException } from 'src/utils/custom-exception';

export enum FileUploadExceptionCode {
  BAD_REQUEST = 'BAD_REQUEST',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_NOT_UPLOADED = 'FILE_NOT_UPLOADED',
  FILE_SIZE_MISMATCH = 'FILE_SIZE_MISMATCH',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
}

export class FileUploadException extends CustomException<FileUploadExceptionCode> {
  constructor(
    message: string,
    code: FileUploadExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage: MessageDescriptor },
  ) {
    super(message, code, {
      userFriendlyMessage,
    });
  }
}
