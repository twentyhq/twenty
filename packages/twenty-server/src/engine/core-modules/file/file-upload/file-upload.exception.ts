import { type MessageDescriptor } from '@lingui/core';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum FileUploadExceptionCode {
  BAD_REQUEST = 'BAD_REQUEST',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_NOT_UPLOADED = 'FILE_NOT_UPLOADED',
  FILE_SIZE_MISMATCH = 'FILE_SIZE_MISMATCH',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  STORAGE_TIMEOUT = 'STORAGE_TIMEOUT',
  STORAGE_INCONSISTENT = 'STORAGE_INCONSISTENT',
}
const FILE_UPLOAD_EXCEPTION_CATEGORY_BY_CODE = {
  [FileUploadExceptionCode.BAD_REQUEST]: 'BAD_USER_INPUT',
  [FileUploadExceptionCode.FILE_NOT_FOUND]: 'NOT_FOUND',
  [FileUploadExceptionCode.FILE_NOT_UPLOADED]: 'BAD_USER_INPUT',
  [FileUploadExceptionCode.FILE_SIZE_MISMATCH]: 'BAD_USER_INPUT',
  [FileUploadExceptionCode.FILE_TOO_LARGE]: 'PAYLOAD_TOO_LARGE',
  [FileUploadExceptionCode.STORAGE_TIMEOUT]: 'GATEWAY_TIMEOUT',
  [FileUploadExceptionCode.STORAGE_INCONSISTENT]: 'BAD_GATEWAY',
} as const satisfies Record<FileUploadExceptionCode, ExceptionCategory>;

export class FileUploadException extends CustomException<FileUploadExceptionCode> {
  constructor(
    message: string,
    code: FileUploadExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage: MessageDescriptor },
  ) {
    super(message, code, {
      userFriendlyMessage,
      category: FILE_UPLOAD_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
