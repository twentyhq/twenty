import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RewriteIsNotNullWorkflowFilterOperandsCommand } from 'src/database/commands/upgrade-version-command/2-36/2-36-workspace-command-1787700000000-rewrite-is-not-null-workflow-filter-operands.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceIteratorModule, WorkspaceCacheModule],
  providers: [RewriteIsNotNullWorkflowFilterOperandsCommand],
})
export class V2_36_UpgradeVersionCommandModule {}
