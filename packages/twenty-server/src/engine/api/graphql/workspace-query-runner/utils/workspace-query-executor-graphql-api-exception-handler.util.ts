import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type WorkspaceQueryExecutorException } from 'src/engine/workspace-query-executor/exceptions/workspace-query-executor.exception';
import { isWorkspaceQueryExecutorUserInputError } from 'src/engine/workspace-query-executor/utils/is-workspace-query-executor-user-input-error.util';

export const workspaceQueryExecutorGraphqlApiExceptionHandler = (
  error: WorkspaceQueryExecutorException,
) => {
  if (isWorkspaceQueryExecutorUserInputError(error)) {
    throw new UserInputError(error.message, {
      userFriendlyMessage: error.userFriendlyMessage,
    });
  }

  throw error;
};
