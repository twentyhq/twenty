import { type MessageDescriptor } from '@lingui/core';

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
  MISSING_TIMEZONE_FOR_DATE_GROUP_BY = 'MISSING_TIMEZONE_FOR_DATE_GROUP_BY',
}

export class CommonQueryRunnerException extends CustomException<CommonQueryRunnerExceptionCode> {
  constructor(
    message: string,
    code: CommonQueryRunnerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage: MessageDescriptor },
  ) {
    super(message, code, {
      userFriendlyMessage,
    });
  }
}
