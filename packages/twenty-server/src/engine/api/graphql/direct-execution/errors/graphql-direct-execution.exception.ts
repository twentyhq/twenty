import { type MessageDescriptor } from '@lingui/core';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum GraphqlDirectExecutionExceptionCode {
  INVALID_QUERY_INPUT = 'INVALID_QUERY_INPUT',
  UNKNOWN_METHOD = 'UNKNOWN_METHOD',
  INVALID_RESULT_TYPE = 'INVALID_RESULT_TYPE',
}
const GRAPHQL_DIRECT_EXECUTION_EXCEPTION_CATEGORY_BY_CODE = {
  [GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT]: 'BAD_USER_INPUT',
  [GraphqlDirectExecutionExceptionCode.UNKNOWN_METHOD]: 'INTERNAL_SERVER_ERROR',
  [GraphqlDirectExecutionExceptionCode.INVALID_RESULT_TYPE]:
    'INTERNAL_SERVER_ERROR',
} as const satisfies Record<
  GraphqlDirectExecutionExceptionCode,
  ExceptionCategory
>;

export class GraphqlDirectExecutionException extends CustomException<GraphqlDirectExecutionExceptionCode> {
  constructor(
    message: string,
    code: GraphqlDirectExecutionExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage: MessageDescriptor },
  ) {
    super(message, code, {
      userFriendlyMessage,
      category: GRAPHQL_DIRECT_EXECUTION_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
