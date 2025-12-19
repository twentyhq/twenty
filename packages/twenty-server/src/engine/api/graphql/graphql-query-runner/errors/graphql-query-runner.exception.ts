import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

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

const graphqlQueryRunnerExceptionUserFriendlyMessages: Record<
  GraphqlQueryRunnerExceptionCode,
  MessageDescriptor
> = {
  [GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT]: msg`Invalid query input.`,
  [GraphqlQueryRunnerExceptionCode.MAX_DEPTH_REACHED]: msg`Maximum query depth reached.`,
  [GraphqlQueryRunnerExceptionCode.INVALID_CURSOR]: msg`Invalid cursor provided.`,
  [GraphqlQueryRunnerExceptionCode.INVALID_DIRECTION]: msg`Invalid direction provided.`,
  [GraphqlQueryRunnerExceptionCode.UNSUPPORTED_OPERATOR]: msg`Unsupported operator.`,
  [GraphqlQueryRunnerExceptionCode.ARGS_CONFLICT]: msg`Conflicting arguments provided.`,
  [GraphqlQueryRunnerExceptionCode.FIELD_NOT_FOUND]: msg`Field not found.`,
  [GraphqlQueryRunnerExceptionCode.MISSING_SYSTEM_FIELD]: msg`Missing required system field.`,
  [GraphqlQueryRunnerExceptionCode.OBJECT_METADATA_NOT_FOUND]: msg`Object not found.`,
  [GraphqlQueryRunnerExceptionCode.RECORD_NOT_FOUND]: msg`Record not found.`,
  [GraphqlQueryRunnerExceptionCode.INVALID_ARGS_FIRST]: msg`Invalid 'first' argument.`,
  [GraphqlQueryRunnerExceptionCode.INVALID_ARGS_LAST]: msg`Invalid 'last' argument.`,
  [GraphqlQueryRunnerExceptionCode.RELATION_SETTINGS_NOT_FOUND]: msg`Relation settings not found.`,
  [GraphqlQueryRunnerExceptionCode.RELATION_TARGET_OBJECT_METADATA_NOT_FOUND]: msg`Relation target not found.`,
  [GraphqlQueryRunnerExceptionCode.NOT_IMPLEMENTED]: msg`This feature is not implemented.`,
  [GraphqlQueryRunnerExceptionCode.INVALID_POST_HOOK_PAYLOAD]: msg`Invalid post-hook payload.`,
  [GraphqlQueryRunnerExceptionCode.UPSERT_MULTIPLE_MATCHING_RECORDS_CONFLICT]: msg`Multiple matching records found during upsert.`,
  [GraphqlQueryRunnerExceptionCode.UPSERT_MAX_RECORDS_EXCEEDED]: msg`Maximum records exceeded for upsert.`,
};

export class GraphqlQueryRunnerException extends CustomException<GraphqlQueryRunnerExceptionCode> {
  constructor(
    message: string,
    code: GraphqlQueryRunnerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        graphqlQueryRunnerExceptionUserFriendlyMessages[code],
    });
  }
}
