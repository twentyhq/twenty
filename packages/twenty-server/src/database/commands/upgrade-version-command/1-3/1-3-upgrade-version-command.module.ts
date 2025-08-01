import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { AddNextStepIdsToWorkflowRunsTrigger } from 'src/database/commands/upgrade-version-command/1-3/1-3-add-next-step-ids-to-workflow-runs-trigger.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    WorkspaceDataSourceModule,
  ],
  providers: [AddNextStepIdsToWorkflowRunsTrigger],
  exports: [AddNextStepIdsToWorkflowRunsTrigger],
})
export class V1_3_UpgradeVersionCommandModule {}
