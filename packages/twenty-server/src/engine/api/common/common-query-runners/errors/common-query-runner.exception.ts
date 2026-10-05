import { type MessageDescriptor } from '@lingui/core';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum CommonQueryRunnerExceptionCode {
  MISSING_FLAT_INDEX_MAPS = 'MISSING_FLAT_INDEX_MAPS',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  INVALID_QUERY_INPUT = 'INVALID_QUERY_INPUT',
  INVALID_AUTH_CONTEXT = 'INVALID_AUTH_CONTEXT',
  ARGS_CONFLICT = 'ARGS_CONFLICT',
  INVALID_ARGS_DATA = 'INVALID_ARGS_DATA',
  INVALID_ARGS_FILTER = 'INVALID_ARGS_FILTER',
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
  INVALID_TIMEZONE = 'INVALID_TIMEZONE',
}
const COMMON_QUERY_RUNNER_EXCEPTION_CATEGORY_BY_CODE = {
  [CommonQueryRunnerExceptionCode.MISSING_FLAT_INDEX_MAPS]:
    'INTERNAL_SERVER_ERROR',
  [CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND]: 'NOT_FOUND',
  [CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT]: 'BAD_USER_INPUT',
  [CommonQueryRunnerExceptionCode.INVALID_AUTH_CONTEXT]: 'UNAUTHENTICATED',
  [CommonQueryRunnerExceptionCode.ARGS_CONFLICT]: 'BAD_USER_INPUT',
  [CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA]: 'BAD_USER_INPUT',
  [CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER]: 'BAD_USER_INPUT',
  [CommonQueryRunnerExceptionCode.INVALID_ARGS_FIRST]: 'BAD_USER_INPUT',
  [CommonQueryRunnerExceptionCode.INVALID_ARGS_LAST]: 'BAD_USER_INPUT',
  [CommonQueryRunnerExceptionCode.UPSERT_MULTIPLE_MATCHING_RECORDS_CONFLICT]:
    'BAD_USER_INPUT',
  [CommonQueryRunnerExceptionCode.MISSING_SYSTEM_FIELD]:
    'INTERNAL_SERVER_ERROR',
  [CommonQueryRunnerExceptionCode.INVALID_CURSOR]: 'BAD_USER_INPUT',
  [CommonQueryRunnerExceptionCode.TOO_MANY_RECORDS_TO_UPDATE]: 'BAD_USER_INPUT',
  [CommonQueryRunnerExceptionCode.BAD_REQUEST]: 'BAD_USER_INPUT',
  [CommonQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR]:
    'INTERNAL_SERVER_ERROR',
  [CommonQueryRunnerExceptionCode.TOO_COMPLEX_QUERY]: 'BAD_USER_INPUT',
  [CommonQueryRunnerExceptionCode.MISSING_TIMEZONE_FOR_DATE_GROUP_BY]:
    'BAD_USER_INPUT',
  [CommonQueryRunnerExceptionCode.INVALID_TIMEZONE]: 'BAD_USER_INPUT',
} as const satisfies Record<CommonQueryRunnerExceptionCode, ExceptionCategory>;

export class CommonQueryRunnerException extends CustomException<CommonQueryRunnerExceptionCode> {
  constructor(
    message: string,
    code: CommonQueryRunnerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage: MessageDescriptor },
  ) {
    super(message, code, {
      userFriendlyMessage,
      category: COMMON_QUERY_RUNNER_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
