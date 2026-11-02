import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { InlineWorkflowStepAgentsCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-workspace-command-1793638670435-inline-workflow-step-agents.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule, WorkspaceIteratorModule],
  providers: [InlineWorkflowStepAgentsCommand],
})
export class V2_56_UpgradeVersionCommandModule {}
