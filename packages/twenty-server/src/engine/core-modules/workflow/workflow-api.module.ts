import { Module } from '@nestjs/common';

import { WorkflowTriggerResolver } from 'src/engine/core-modules/workflow/resolvers/workflow-trigger.resolver';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';
import { WorkflowResolver } from 'src/engine/core-modules/workflow/resolvers/workflow.resolver';

@Module({
  imports: [WorkflowTriggerModule],
  providers: [WorkflowTriggerResolver, WorkflowResolver],
})
export class WorkflowApiModule {}
