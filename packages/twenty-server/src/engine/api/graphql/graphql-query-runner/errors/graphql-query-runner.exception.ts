import { type MessageDescriptor } from '@lingui/core';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum GraphqlQueryRunnerExceptionCode {
  INVALID_QUERY_INPUT = 'INVALID_QUERY_INPUT',
  MAX_DEPTH_REACHED = 'MAX_DEPTH_REACHED',
  INVALID_CURSOR = 'INVALID_CURSOR',
  INVALID_DIRECTION = 'INVALID_DIRECTION',
  UNSUPPORTED_OPERATOR = 'UNSUPPORTED_OPERATOR',
  ARGS_CONFLICT = 'ARGS_CONFLICT',
  FIELD_NOT_FOUND = 'FIELD_NOT_FOUND',
  MISSING_SYSTEM_FIELD = 'MISSING_SYSTEM_FIELD',
  OBJECT_METADATA_NOT_FOUND = 'OBJECT_METADATA_NOT_FOUND',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  INVALID_ARGS_FIRST = 'INVALID_ARGS_FIRST',
  INVALID_ARGS_LAST = 'INVALID_ARGS_LAST',
  RELATION_SETTINGS_NOT_FOUND = 'RELATION_SETTINGS_NOT_FOUND',
  RELATION_TARGET_OBJECT_METADATA_NOT_FOUND = 'RELATION_TARGET_OBJECT_METADATA_NOT_FOUND',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  INVALID_POST_HOOK_PAYLOAD = 'INVALID_POST_HOOK_PAYLOAD',
  UPSERT_MULTIPLE_MATCHING_RECORDS_CONFLICT = 'UPSERT_MULTIPLE_MATCHING_RECORDS_CONFLICT',
  UPSERT_MAX_RECORDS_EXCEEDED = 'UPSERT_MAX_RECORDS_EXCEEDED',
}
const GRAPHQL_QUERY_RUNNER_EXCEPTION_CATEGORY_BY_CODE = {
  [GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT]: 'BAD_USER_INPUT',
  [GraphqlQueryRunnerExceptionCode.MAX_DEPTH_REACHED]: 'BAD_USER_INPUT',
  [GraphqlQueryRunnerExceptionCode.INVALID_CURSOR]: 'BAD_USER_INPUT',
  [GraphqlQueryRunnerExceptionCode.INVALID_DIRECTION]: 'BAD_USER_INPUT',
  [GraphqlQueryRunnerExceptionCode.UNSUPPORTED_OPERATOR]: 'BAD_USER_INPUT',
  [GraphqlQueryRunnerExceptionCode.ARGS_CONFLICT]: 'BAD_USER_INPUT',
  [GraphqlQueryRunnerExceptionCode.FIELD_NOT_FOUND]: 'BAD_USER_INPUT',
  [GraphqlQueryRunnerExceptionCode.MISSING_SYSTEM_FIELD]:
    'INTERNAL_SERVER_ERROR',
  [GraphqlQueryRunnerExceptionCode.OBJECT_METADATA_NOT_FOUND]: 'BAD_USER_INPUT',
  [GraphqlQueryRunnerExceptionCode.RECORD_NOT_FOUND]: 'NOT_FOUND',
  [GraphqlQueryRunnerExceptionCode.INVALID_ARGS_FIRST]: 'BAD_USER_INPUT',
  [GraphqlQueryRunnerExceptionCode.INVALID_ARGS_LAST]: 'BAD_USER_INPUT',
  [GraphqlQueryRunnerExceptionCode.RELATION_SETTINGS_NOT_FOUND]:
    'INTERNAL_SERVER_ERROR',
  [GraphqlQueryRunnerExceptionCode.RELATION_TARGET_OBJECT_METADATA_NOT_FOUND]:
    'INTERNAL_SERVER_ERROR',
  [GraphqlQueryRunnerExceptionCode.NOT_IMPLEMENTED]: 'BAD_USER_INPUT',
  [GraphqlQueryRunnerExceptionCode.INVALID_POST_HOOK_PAYLOAD]:
    'INTERNAL_SERVER_ERROR',
  [GraphqlQueryRunnerExceptionCode.UPSERT_MULTIPLE_MATCHING_RECORDS_CONFLICT]:
    'BAD_USER_INPUT',
  [GraphqlQueryRunnerExceptionCode.UPSERT_MAX_RECORDS_EXCEEDED]:
    'BAD_USER_INPUT',
} as const satisfies Record<GraphqlQueryRunnerExceptionCode, ExceptionCategory>;

export class GraphqlQueryRunnerException extends CustomException<GraphqlQueryRunnerExceptionCode> {
  constructor(
    message: string,
    code: GraphqlQueryRunnerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage: MessageDescriptor },
  ) {
    super(message, code, {
      userFriendlyMessage,
      category: GRAPHQL_QUERY_RUNNER_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
