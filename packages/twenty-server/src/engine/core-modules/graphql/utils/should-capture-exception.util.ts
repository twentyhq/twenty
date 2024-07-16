import {
  BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const graphQLErrorCodesToFilter = [
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
    graphQLErrorCodesToFilter.includes(exception?.extensions?.code)
  ) {
    return true;
  }

  return false;
};
