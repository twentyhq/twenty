import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { UnpinNewAiChatCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791405719721-unpin-new-ai-chat.command';
import { UnfollowChatsMembersOnlyReadCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791728623417-unfollow-chats-members-only-read.command';
import { DropLegacyChatColumnsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791730401449-drop-legacy-chat-columns.command';
import { RelabelMessageCampaignCountFieldsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791807747784-relabel-message-campaign-count-fields.command';
import { SplitEmailBlockSettingsCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791810616035-split-email-block-settings-command-menu-item.command';
import { AddToMessageListCommandMenuItemCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791832891598-add-to-message-list-command-menu-item.command';
import { MakeMessageListMemberNonUiCreatableCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791833382889-make-message-list-member-non-ui-creatable.command';
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
    RelabelMessageCampaignCountFieldsCommand,
    SplitEmailBlockSettingsCommandMenuItemCommand,
    AddToMessageListCommandMenuItemCommand,
    MakeMessageListMemberNonUiCreatableCommand,
    provideWorkspaceScopedRepository(FieldMetadataEntity),
  ],
})
export class V2_47_UpgradeVersionCommandModule {}
