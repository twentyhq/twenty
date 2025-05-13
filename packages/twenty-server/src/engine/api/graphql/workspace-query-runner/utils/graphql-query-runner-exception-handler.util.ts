import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import {
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { CustomException } from 'src/utils/custom-exception';

export const graphqlQueryRunnerExceptionHandler = (
  error: GraphqlQueryRunnerException,
) => {
  switch (error.code) {
    case GraphqlQueryRunnerExceptionCode.INVALID_ARGS_FIRST:
    case GraphqlQueryRunnerExceptionCode.INVALID_ARGS_LAST:
    case GraphqlQueryRunnerExceptionCode.OBJECT_METADATA_NOT_FOUND:
    case GraphqlQueryRunnerExceptionCode.MAX_DEPTH_REACHED:
    case GraphqlQueryRunnerExceptionCode.INVALID_CURSOR:
    case GraphqlQueryRunnerExceptionCode.INVALID_DIRECTION:
    case GraphqlQueryRunnerExceptionCode.UNSUPPORTED_OPERATOR:
    case GraphqlQueryRunnerExceptionCode.ARGS_CONFLICT:
    case GraphqlQueryRunnerExceptionCode.FIELD_NOT_FOUND:
    case GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT:
    case GraphqlQueryRunnerExceptionCode.NOT_IMPLEMENTED:
      throw new UserInputError(error.message);
    case GraphqlQueryRunnerExceptionCode.RECORD_NOT_FOUND:
      throw new NotFoundError(error.message);
    default:
      throw new CustomException(error.message, error.code);
  }
};
