import { NodeEnvironment } from 'src/engine/core-modules/environment/interfaces/node-environment.interface';

import {
  BaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const generateGraphQLErrorFromError = (error: Error) => {
  const graphqlError = new BaseGraphQLError(
    error.message,
    ErrorCode.INTERNAL_SERVER_ERROR,
  );

  if (process.env.NODE_ENV === NodeEnvironment.development) {
    graphqlError.stack = error.stack;
    graphqlError.extensions['response'] = error.message;
  }

  return graphqlError;
};
