import { assertUnreachable } from 'twenty-shared/utils';

import {
  type WorkspaceQueryRunnerException,
  WorkspaceQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';
import {
  ForbiddenError,
  NotFoundError,
  TimeoutError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const workspaceExceptionHandler = (
  error: WorkspaceQueryRunnerException,
) => {
  switch (error.code) {
    case WorkspaceQueryRunnerExceptionCode.DATA_NOT_FOUND:
      throw new NotFoundError(error);
    case WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT:
      throw new UserInputError(error);
    case WorkspaceQueryRunnerExceptionCode.QUERY_VIOLATES_UNIQUE_CONSTRAINT:
    case WorkspaceQueryRunnerExceptionCode.QUERY_VIOLATES_FOREIGN_KEY_CONSTRAINT:
    case WorkspaceQueryRunnerExceptionCode.TOO_MANY_ROWS_AFFECTED:
    case WorkspaceQueryRunnerExceptionCode.NO_ROWS_AFFECTED:
      throw new ForbiddenError(error);
    case WorkspaceQueryRunnerExceptionCode.QUERY_TIMEOUT:
      throw new TimeoutError(error);
    case WorkspaceQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR:
      throw error;
    default: {
      return assertUnreachable(error.code);
    }
  }
};
