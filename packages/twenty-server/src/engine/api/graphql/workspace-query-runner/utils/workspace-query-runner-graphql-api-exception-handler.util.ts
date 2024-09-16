import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import {
  WorkspaceQueryRunnerException,
  WorkspaceQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';
import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  TimeoutError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const workspaceQueryRunnerGraphqlApiExceptionHandler = (
  error: Error,
) => {
  if (error instanceof WorkspaceQueryRunnerException) {
    switch (error.code) {
      case WorkspaceQueryRunnerExceptionCode.DATA_NOT_FOUND:
        throw new NotFoundError(error.message);
      case WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT:
        throw new UserInputError(error.message);
      case WorkspaceQueryRunnerExceptionCode.QUERY_VIOLATES_UNIQUE_CONSTRAINT:
      case WorkspaceQueryRunnerExceptionCode.QUERY_VIOLATES_FOREIGN_KEY_CONSTRAINT:
      case WorkspaceQueryRunnerExceptionCode.TOO_MANY_ROWS_AFFECTED:
      case WorkspaceQueryRunnerExceptionCode.NO_ROWS_AFFECTED:
        throw new ForbiddenError(error.message);
      case WorkspaceQueryRunnerExceptionCode.QUERY_TIMEOUT:
        throw new TimeoutError(error.message);
      case WorkspaceQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR:
      default:
        throw new InternalServerError(error.message);
    }
  }

  if (error instanceof GraphqlQueryRunnerException) {
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
        throw new UserInputError(error.message);
      case GraphqlQueryRunnerExceptionCode.RECORD_NOT_FOUND:
        throw new NotFoundError(error.message);
      default:
        throw new InternalServerError(error.message);
    }
  }

  throw error;
};
