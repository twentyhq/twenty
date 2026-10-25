import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConflictError,
  InternalServerError,
  NotFoundError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type WorkspaceDataExportException } from 'src/engine/core-modules/workspace-data-export/workspace-data-export.exception';

export const workspaceDataExportGraphqlApiExceptionHandler = (
  exception: WorkspaceDataExportException,
) => {
  switch (exception.code) {
    case 'WORKSPACE_NOT_FOUND':
      throw new NotFoundError(exception);
    case 'EXPORT_ALREADY_RUNNING':
      throw new ConflictError(exception);
    case 'EXPORT_INCOMPLETE':
      throw new InternalServerError(exception);
    default:
      assertUnreachable(exception.code);
  }
};
