import { Module } from '@nestjs/common';

import { CORE_WORKFLOW_APP_OPERATIONS_SDL_APPENDER } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/core-workflow-app-operations-sdl.constants';
import { appendCoreWorkflowAppOperationsToSdl } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/utils/append-core-workflow-app-operations-to-sdl.util';

@Module({
  providers: [
    {
      provide: CORE_WORKFLOW_APP_OPERATIONS_SDL_APPENDER,
      useValue: appendCoreWorkflowAppOperationsToSdl,
    },
  ],
  exports: [CORE_WORKFLOW_APP_OPERATIONS_SDL_APPENDER],
})
export class CoreWorkflowAppOperationsSdlModule {}
