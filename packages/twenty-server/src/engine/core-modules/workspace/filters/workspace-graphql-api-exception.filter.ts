import { Catch, type ExceptionFilter } from '@nestjs/common';

import { workspaceGraphqlApiExceptionHandler } from 'src/engine/core-modules/workspace/utils/workspace-graphql-api-exception-handler.util';
import { WorkspaceException } from 'src/engine/core-modules/workspace/workspace.exception';

@Catch(WorkspaceException)
export class WorkspaceGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: WorkspaceException) {
    return workspaceGraphqlApiExceptionHandler(exception);
  }
}
