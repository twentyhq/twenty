import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { UnpinNewAiChatCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791405719721-unpin-new-ai-chat.command';
import { UnfollowChatsMembersOnlyReadCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791728623417-unfollow-chats-members-only-read.command';
import { DropLegacyChatColumnsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791730401449-drop-legacy-chat-columns.command';
import { AddMessageListMemberCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791789514736-add-message-list-member-command-menu-items.command';
import { MergeAiChatInboxFeatureFlagsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791822328094-merge-ai-chat-inbox-feature-flags.command';
import { UnpinChatShareCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791823097314-unpin-chat-share.command';
import { SyncCampaignEngagementFieldsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791811197174-sync-campaign-engagement-fields.command';
import { ConvertWorkflowEmailBodiesToEmailDocumentsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791811310066-convert-workflow-email-bodies-to-email-documents.command';
import { RemoveWorkflowCoreIndexFlagFromCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791823009575-remove-workflow-core-index-flag-from-command-menu-items.command';
import { RelabelNoteAndTaskTargetFieldsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791926793834-relabel-note-and-task-target-fields.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    TypeOrmModule.forFeature([FieldMetadataEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    UnpinNewAiChatCommand,
    UnfollowChatsMembersOnlyReadCommand,
    DropLegacyChatColumnsCommand,
    AddMessageListMemberCommandMenuItemsCommand,
    MergeAiChatInboxFeatureFlagsCommand,
    UnpinChatShareCommand,
    SyncCampaignEngagementFieldsCommand,
    ConvertWorkflowEmailBodiesToEmailDocumentsCommand,
    RemoveWorkflowCoreIndexFlagFromCommandMenuItemsCommand,
    RelabelNoteAndTaskTargetFieldsCommand,
    provideWorkspaceScopedRepository(FieldMetadataEntity),
  ],
})
export class V2_47_UpgradeVersionCommandModule {}
