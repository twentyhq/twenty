import { Catch, type ExceptionFilter } from '@nestjs/common';

import { workspaceDataExportGraphqlApiExceptionHandler } from 'src/engine/core-modules/workspace-data-export/utils/workspace-data-export-graphql-api-exception-handler.util';
import { WorkspaceDataExportException } from 'src/engine/core-modules/workspace-data-export/workspace-data-export.exception';

@Catch(WorkspaceDataExportException)
export class WorkspaceDataExportGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: WorkspaceDataExportException) {
    return workspaceDataExportGraphqlApiExceptionHandler(exception);
  }
}
