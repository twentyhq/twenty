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

export const workspaceExceptionHandler = (
  error: WorkspaceQueryRunnerException,
) => {
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
};
