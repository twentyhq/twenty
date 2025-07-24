import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RemoveWorkflowRunsWithoutState } from 'src/database/commands/upgrade-version-command/1-2/1-2-remove-workflow-runs-without-state.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AddNextStepIdsToWorkflowVersionTriggers } from 'src/database/commands/upgrade-version-command/1-2/1-2-add-next-step-ids-to-workflow-version-triggers.command';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace], 'core')],
  providers: [
    RemoveWorkflowRunsWithoutState,
    AddNextStepIdsToWorkflowVersionTriggers,
  ],
  exports: [
    RemoveWorkflowRunsWithoutState,
    AddNextStepIdsToWorkflowVersionTriggers,
  ],
})
export class V1_2_UpgradeVersionCommandModule {}
