import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AgentHistoryMigrationModule } from 'src/database/commands/agent-history/agent-history-migration.module';
import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AttributeChatMessageSendersCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790171503075-attribute-chat-message-senders.command';
import { DeleteSystemReadableObjectNavigationCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790180964414-delete-system-readable-object-navigation-command-menu-items.command';
import { MoveCampaignSendingTablesToWorkspaceCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790203235337-move-campaign-sending-tables-to-workspace.command';
import { EnableCommonRecordSharingCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790251806563-enable-common-record-sharing.command';
import { BackfillLogicFunctionFileRowsCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790262034322-backfill-logic-function-file-rows.command';
import { LinkChatThreadsToWorkspaceMembersCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790265551448-link-chat-threads-to-workspace-members.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    AgentHistoryMigrationModule,
    AgentHistoryModule,
    ApplicationModule,
    TypeOrmModule.forFeature([FileEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    BillingModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    AttributeChatMessageSendersCommand,
    EnableCommonRecordSharingCommand,
    DeleteSystemReadableObjectNavigationCommandMenuItemsCommand,
    MoveCampaignSendingTablesToWorkspaceCommand,
    BackfillLogicFunctionFileRowsCommand,
    provideWorkspaceScopedRepository(FileEntity),
    LinkChatThreadsToWorkspaceMembersCommand,
  ],
})
export class V2_43_UpgradeVersionCommandModule {}
