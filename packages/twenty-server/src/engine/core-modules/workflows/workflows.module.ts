import { Module } from '@nestjs/common';

import { StartWorkflowCommand } from 'src/engine/core-modules/workflows/commands/start-workflow.command';

@Module({
  imports: [],
  controllers: [],
  providers: [StartWorkflowCommand],
  exports: [],
})
export class WorkflowsModule {}
