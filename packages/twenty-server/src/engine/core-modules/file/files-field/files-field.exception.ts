import { type MessageDescriptor } from '@lingui/core';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum FilesFieldExceptionCode {
  FILE_DELETION_FAILED = 'FILE_DELETION_FAILED',
  BAD_REQUEST = 'BAD_REQUEST',
  TEMPORARY_FILE_NOT_ALLOWED = 'TEMPORARY_FILE_NOT_ALLOWED',
}
const FILES_FIELD_EXCEPTION_CATEGORY_BY_CODE = {
  [FilesFieldExceptionCode.FILE_DELETION_FAILED]: 'INTERNAL_SERVER_ERROR',
  [FilesFieldExceptionCode.BAD_REQUEST]: 'INTERNAL_SERVER_ERROR',
  [FilesFieldExceptionCode.TEMPORARY_FILE_NOT_ALLOWED]: 'INTERNAL_SERVER_ERROR',
} as const satisfies Record<FilesFieldExceptionCode, ExceptionCategory>;

export class FilesFieldException extends CustomException<FilesFieldExceptionCode> {
  constructor(
    message: string,
    code: FilesFieldExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage: MessageDescriptor },
  ) {
    super(message, code, {
      userFriendlyMessage,
      category: FILES_FIELD_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
