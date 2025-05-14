import { HttpException } from '@nestjs/common';

import {
  BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const graphQLErrorCodesToFilterOut = [
  ErrorCode.GRAPHQL_VALIDATION_FAILED,
  ErrorCode.UNAUTHENTICATED,
  ErrorCode.FORBIDDEN,
  ErrorCode.NOT_FOUND,
  ErrorCode.METHOD_NOT_ALLOWED,
  ErrorCode.TIMEOUT,
  ErrorCode.CONFLICT,
  ErrorCode.BAD_USER_INPUT,
];

export const shouldCaptureException = (exception: Error): boolean => {
  if (
    exception instanceof BaseGraphQLError &&
    graphQLErrorCodesToFilterOut.includes(exception?.extensions?.code)
  ) {
    return false;
  }

  if (
    exception instanceof HttpException &&
    exception.getStatus() >= 400 &&
    exception.getStatus() < 500
  ) {
    return false;
  }

  return true;
};
