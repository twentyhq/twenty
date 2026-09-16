import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RelinkWorkflowVersionsToCoreWorkflowsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789566000000-relink-workflow-versions-to-core-workflows.command';

@Module({
  imports: [WorkspaceIteratorModule],
  providers: [RelinkWorkflowVersionsToCoreWorkflowsCommand],
  exports: [RelinkWorkflowVersionsToCoreWorkflowsCommand],
})
export class V2_42_UpgradeVersionCommandModule {}
