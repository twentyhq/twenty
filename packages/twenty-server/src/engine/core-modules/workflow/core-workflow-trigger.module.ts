import { Module } from '@nestjs/common';

import { WorkflowTriggerResolver } from 'src/engine/core-modules/workflow/workflow-trigger.resolver';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';
import { WorkflowTriggerService } from 'src/modules/workflow/workflow-trigger/workflow-trigger.service';

@Module({
  imports: [WorkflowCommonModule, WorkflowRunnerModule],
  providers: [WorkflowTriggerService, WorkflowTriggerResolver],
})
export class WorkflowTriggerCoreModule {}
