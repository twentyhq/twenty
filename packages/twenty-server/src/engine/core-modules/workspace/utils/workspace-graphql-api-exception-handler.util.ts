import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
} from 'src/engine/core-modules/workspace/workspace.exception';

export const workspaceGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof WorkspaceException) {
    switch (error.code) {
      case WorkspaceExceptionCode.SUBDOMAIN_NOT_FOUND:
      case WorkspaceExceptionCode.WORKSPACE_NOT_FOUND:
        throw new NotFoundError(error.message);
      case WorkspaceExceptionCode.DOMAIN_ALREADY_TAKEN:
      case WorkspaceExceptionCode.SUBDOMAIN_ALREADY_TAKEN:
        throw new ConflictError(error.message);
      case WorkspaceExceptionCode.ENVIRONMENT_VAR_NOT_ENABLED:
      case WorkspaceExceptionCode.WORKSPACE_CUSTOM_DOMAIN_DISABLED:
        throw new ForbiddenError(error.message);
      default: {
        const _exhaustiveCheck: never = error.code;

        throw error;
      }
    }
  }

  throw error;
};
