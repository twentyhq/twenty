import { type MessageDescriptor } from '@lingui/core';

import { CustomException } from 'src/utils/custom-exception';

export enum GraphqlDirectExecutionExceptionCode {
  INVALID_QUERY_INPUT = 'INVALID_QUERY_INPUT',
  UNKNOWN_METHOD = 'UNKNOWN_METHOD',
  INVALID_RESULT_TYPE = 'INVALID_RESULT_TYPE',
}

export class GraphqlDirectExecutionException extends CustomException<GraphqlDirectExecutionExceptionCode> {
  constructor(
    message: string,
    code: GraphqlDirectExecutionExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage: MessageDescriptor },
  ) {
    super(message, code, {
      userFriendlyMessage,
    });
  }
}
