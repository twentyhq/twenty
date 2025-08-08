import {
  ConflictError,
  NotFoundError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { workspaceGraphqlApiExceptionHandler } from 'src/engine/core-modules/workspace/utils/workspace-graphql-api-exception-handler.util';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
} from 'src/engine/core-modules/workspace/workspace.exception';

describe('workspaceGraphqlApiExceptionHandler', () => {
  it('should throw NotFoundError when WorkspaceExceptionCode is SUBDOMAIN_NOT_FOUND', () => {
    const error = new WorkspaceException(
      'Subdomain not found',
      WorkspaceExceptionCode.SUBDOMAIN_NOT_FOUND,
    );

    expect(() => workspaceGraphqlApiExceptionHandler(error)).toThrow(
      NotFoundError,
    );
  });

  it('should throw NotFoundError when WorkspaceExceptionCode is WORKSPACE_NOT_FOUND', () => {
    const error = new WorkspaceException(
      'Workspace not found',
      WorkspaceExceptionCode.WORKSPACE_NOT_FOUND,
    );

    expect(() => workspaceGraphqlApiExceptionHandler(error)).toThrow(
      NotFoundError,
    );
  });

  it('should throw ConflictError when WorkspaceExceptionCode is SUBDOMAIN_ALREADY_TAKEN', () => {
    const error = new WorkspaceException(
      'Subdomain already taken',
      WorkspaceExceptionCode.SUBDOMAIN_ALREADY_TAKEN,
    );

    expect(() => workspaceGraphqlApiExceptionHandler(error)).toThrow(
      ConflictError,
    );
  });

  it('should throw the original error if it is not a WorkspaceException', () => {
    const genericError = new Error('Generic error');

    expect(() => workspaceGraphqlApiExceptionHandler(genericError)).toThrow(
      genericError,
    );
  });
});
