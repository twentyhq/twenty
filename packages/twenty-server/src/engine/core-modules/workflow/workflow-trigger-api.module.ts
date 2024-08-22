import { Module } from '@nestjs/common';

import { WorkflowTriggerResolver } from 'src/engine/core-modules/workflow/workflow-trigger.resolver';
import { WorkflowTriggerModule } from 'src/modules/workflow/workflow-trigger/workflow-trigger.module';

@Module({
  imports: [WorkflowTriggerModule],
  providers: [WorkflowTriggerResolver],
})
export class WorkflowTriggerApiModule {}
