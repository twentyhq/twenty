import { Module } from '@nestjs/common';

import { WorkflowTriggerResolver } from 'src/engine/core-modules/workflow/workflow-trigger.resolver';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';
import { WorkflowRunnerModule } from 'src/modules/workflow/workflow-runner/workflow-runner.module';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workflow-trigger.workspace-service';

@Module({
  imports: [WorkflowCommonModule, WorkflowRunnerModule],
  providers: [WorkflowTriggerWorkspaceService, WorkflowTriggerResolver],
})
export class WorkflowTriggerCoreModule {}
