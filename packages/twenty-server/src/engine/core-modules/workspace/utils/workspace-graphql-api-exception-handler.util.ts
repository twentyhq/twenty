import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
} from 'src/engine/core-modules/workspace/workspace.exception';
import { CustomException } from 'src/utils/custom-exception';

export const workspaceGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof WorkspaceException) {
    switch (error.code) {
      case WorkspaceExceptionCode.SUBDOMAIN_NOT_FOUND:
      case WorkspaceExceptionCode.WORKSPACE_NOT_FOUND:
        throw new NotFoundError(error.message);
      case WorkspaceExceptionCode.SUBDOMAIN_ALREADY_TAKEN:
        throw new ConflictError(error.message);
      case WorkspaceExceptionCode.ENVIRONMENT_VAR_NOT_ENABLED:
        throw new ForbiddenError(error.message);
      default:
        throw new CustomException(error.message, error.code);
    }
  }

  throw error;
};
