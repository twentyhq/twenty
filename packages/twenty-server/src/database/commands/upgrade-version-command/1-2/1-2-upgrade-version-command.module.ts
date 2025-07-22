import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RemoveWorkflowRunsWithoutState } from 'src/database/commands/upgrade-version-command/1-2/1-2-remove-workflow-runs-without-state.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace], 'core')],
  providers: [RemoveWorkflowRunsWithoutState],
  exports: [RemoveWorkflowRunsWithoutState],
})
export class V1_2_UpgradeVersionCommandModule {}
