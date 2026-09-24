import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AgentHistoryMigrationModule } from 'src/database/commands/agent-history/agent-history-migration.module';
import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { AttributeChatMessageSendersCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790171503075-attribute-chat-message-senders.command';
import { RelabelAttachmentTargetFieldsCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790266078808-relabel-attachment-target-fields.command';
import { SyncAttachmentRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790266078807-sync-attachment-record-page.command';
import { DeleteSystemReadableObjectNavigationCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790180964414-delete-system-readable-object-navigation-command-menu-items.command';
import { MoveCampaignSendingTablesToWorkspaceCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790203235337-move-campaign-sending-tables-to-workspace.command';
import { BackfillLogicFunctionFileRowsCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790262034322-backfill-logic-function-file-rows.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldMetadataEntity]),
    ApplicationModule,
    AgentHistoryMigrationModule,
    AgentHistoryModule,
    TypeOrmModule.forFeature([FileEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    AttributeChatMessageSendersCommand,
    DeleteSystemReadableObjectNavigationCommandMenuItemsCommand,
    MoveCampaignSendingTablesToWorkspaceCommand,
    BackfillLogicFunctionFileRowsCommand,
    SyncAttachmentRecordPageCommand,
    RelabelAttachmentTargetFieldsCommand,
    provideWorkspaceScopedRepository(FileEntity),
  ],
})
export class V2_43_UpgradeVersionCommandModule {}
