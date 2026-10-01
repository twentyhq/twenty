import { Module } from '@nestjs/common';

import { AgentHistoryMigrationModule } from 'src/database/commands/agent-history/agent-history-migration.module';
import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RestrictExportRecordsToIndexPageCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790837443029-restrict-export-records-to-index-page.command';
import { AddAgentChatThreadParticipantObjectCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790842377355-add-agent-chat-thread-participant-object.command';
import { BackfillAgentChatThreadInboxStateCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790842377356-backfill-agent-chat-thread-inbox-state.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    AgentHistoryMigrationModule,
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    RestrictExportRecordsToIndexPageCommand,
    AddAgentChatThreadParticipantObjectCommand,
    BackfillAgentChatThreadInboxStateCommand,
  ],
})
export class V2_45_UpgradeVersionCommandModule {}
