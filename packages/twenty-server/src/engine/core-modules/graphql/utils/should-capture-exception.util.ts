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
  if (!(exception instanceof BaseGraphQLError)) {
    return true;
  }

  if (graphQLErrorCodesToFilterOut.includes(exception?.extensions?.code)) {
    return false;
  }

  return true;
};
