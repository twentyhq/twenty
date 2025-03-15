import { GraphQLErrorCode } from 'twenty-shared';

import { BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const graphQLErrorCodesToFilterOut = [
  GraphQLErrorCode.GRAPHQL_VALIDATION_FAILED,
  GraphQLErrorCode.UNAUTHENTICATED,
  GraphQLErrorCode.FORBIDDEN,
  GraphQLErrorCode.NOT_FOUND,
  GraphQLErrorCode.METHOD_NOT_ALLOWED,
  GraphQLErrorCode.TIMEOUT,
  GraphQLErrorCode.CONFLICT,
  GraphQLErrorCode.BAD_USER_INPUT,
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
