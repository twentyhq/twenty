import { Module } from '@nestjs/common';

import { WorkflowTriggerResolver } from 'src/engine/core-modules/workflow/workflow-trigger.resolver';
import { WorkflowTriggerService } from 'src/modules/workflow/workflow-trigger/workflow-trigger.service';

@Module({
  providers: [WorkflowTriggerService, WorkflowTriggerResolver],
})
export class WorkflowTriggerModule {}
