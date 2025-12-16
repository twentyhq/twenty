import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum CommonQueryRunnerExceptionCode {
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  INVALID_QUERY_INPUT = 'INVALID_QUERY_INPUT',
  INVALID_AUTH_CONTEXT = 'INVALID_AUTH_CONTEXT',
  ARGS_CONFLICT = 'ARGS_CONFLICT',
  INVALID_ARGS_DATA = 'INVALID_ARGS_DATA',
  INVALID_ARGS_FIRST = 'INVALID_ARGS_FIRST',
  INVALID_ARGS_LAST = 'INVALID_ARGS_LAST',
  UPSERT_MULTIPLE_MATCHING_RECORDS_CONFLICT = 'UPSERT_MULTIPLE_MATCHING_RECORDS_CONFLICT',
  MISSING_SYSTEM_FIELD = 'MISSING_SYSTEM_FIELD',
  INVALID_CURSOR = 'INVALID_CURSOR',
  TOO_MANY_RECORDS_TO_UPDATE = 'TOO_MANY_RECORDS_TO_UPDATE',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  TOO_COMPLEX_QUERY = 'TOO_COMPLEX_QUERY',
}

const commonQueryRunnerExceptionUserFriendlyMessages: Record<
  CommonQueryRunnerExceptionCode,
  MessageDescriptor
> = {
  [CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND]: msg`Record not found.`,
  [CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT]: msg`Invalid query input.`,
  [CommonQueryRunnerExceptionCode.INVALID_AUTH_CONTEXT]: msg`Invalid authentication context.`,
  [CommonQueryRunnerExceptionCode.ARGS_CONFLICT]: msg`Conflicting arguments provided.`,
  [CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA]: msg`Invalid data provided.`,
  [CommonQueryRunnerExceptionCode.INVALID_ARGS_FIRST]: msg`Invalid 'first' argument.`,
  [CommonQueryRunnerExceptionCode.INVALID_ARGS_LAST]: msg`Invalid 'last' argument.`,
  [CommonQueryRunnerExceptionCode.UPSERT_MULTIPLE_MATCHING_RECORDS_CONFLICT]: msg`Multiple matching records found during upsert.`,
  [CommonQueryRunnerExceptionCode.MISSING_SYSTEM_FIELD]: msg`Missing required system field.`,
  [CommonQueryRunnerExceptionCode.INVALID_CURSOR]: msg`Invalid cursor provided.`,
  [CommonQueryRunnerExceptionCode.TOO_MANY_RECORDS_TO_UPDATE]: msg`Too many records to update at once.`,
  [CommonQueryRunnerExceptionCode.BAD_REQUEST]: msg`Bad request.`,
  [CommonQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR]: msg`An unexpected error occurred.`,
  [CommonQueryRunnerExceptionCode.TOO_COMPLEX_QUERY]: msg`Query is too complex.`,
};

export class CommonQueryRunnerException extends CustomException<CommonQueryRunnerExceptionCode> {
  constructor(
    message: string,
    code: CommonQueryRunnerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        commonQueryRunnerExceptionUserFriendlyMessages[code],
    });
  }
}
