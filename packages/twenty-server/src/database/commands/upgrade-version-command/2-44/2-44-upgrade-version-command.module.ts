import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddInputAskObjectCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790550923552-add-input-ask-object.command';
import { AddWorkflowRunToChatThreadsCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790544016508-add-workflow-run-to-chat-threads.command';
import { FollowWorkflowVisibilityOnRunsCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790540462614-follow-workflow-visibility-on-runs.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    FollowWorkflowVisibilityOnRunsCommand,
    AddWorkflowRunToChatThreadsCommand,
    AddInputAskObjectCommand,
  ],
})
export class V2_44_UpgradeVersionCommandModule {}
