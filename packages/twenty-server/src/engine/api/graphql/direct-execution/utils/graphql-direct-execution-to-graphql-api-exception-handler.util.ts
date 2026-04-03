import { assertUnreachable } from 'twenty-shared/utils';

import {
  GraphqlDirectExecutionException,
  GraphqlDirectExecutionExceptionCode,
} from 'src/engine/api/graphql/direct-execution/errors/graphql-direct-execution.exception';
import {
  InternalServerError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const graphqlDirectExecutionToGraphqlApiExceptionHandler = (
  error: GraphqlDirectExecutionException,
) => {
  switch (error.code) {
    case GraphqlDirectExecutionExceptionCode.INVALID_QUERY_INPUT:
      throw new UserInputError(error);
    case GraphqlDirectExecutionExceptionCode.INVALID_RESULT_TYPE:
    case GraphqlDirectExecutionExceptionCode.UNKNOWN_METHOD:
      throw new InternalServerError(error);
    default: {
      return assertUnreachable(error.code);
    }
  }
};
