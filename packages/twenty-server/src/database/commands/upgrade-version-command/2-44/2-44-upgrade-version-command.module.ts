import { VerifyCommonRecordSharingCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790590808102-verify-common-record-sharing.command';
import { Module } from '@nestjs/common';
import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { LinkChatMessageSendersToWorkspaceMembersCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790541986177-link-chat-message-senders-to-workspace-members.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { AgentHistoryMigrationModule } from 'src/database/commands/agent-history/agent-history-migration.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    WorkspaceIteratorModule,
    ApplicationModule,
    AgentHistoryMigrationModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    LinkChatMessageSendersToWorkspaceMembersCommand,
    VerifyCommonRecordSharingCommand,
  ],
})
export class V2_44_UpgradeVersionCommandModule {}
