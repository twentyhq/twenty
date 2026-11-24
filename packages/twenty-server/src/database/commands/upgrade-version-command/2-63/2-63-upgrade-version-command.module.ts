import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddChannelAssociationAccountOwnerAndHandleCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-workspace-command-1795432675597-add-channel-association-account-owner-and-handle.command';
import { AddChannelTargetRelatedRecordPathsCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-workspace-command-1795449569000-add-channel-target-related-record-paths.command';
import { AddRichTextFileIdsColumnsCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-workspace-command-1795470090382-add-rich-text-file-ids-columns.command';
import { ResyncChannelVisibilityUnreadableNestedFieldsCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-workspace-command-1795478765005-resync-channel-visibility-unreadable-nested-fields.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ChannelVisibilityModule } from 'src/engine/permissions/channel-visibility/channel-visibility.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    ChannelVisibilityModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    AddChannelAssociationAccountOwnerAndHandleCommand,
    AddChannelTargetRelatedRecordPathsCommand,
    AddRichTextFileIdsColumnsCommand,
    ResyncChannelVisibilityUnreadableNestedFieldsCommand,
  ],
})
export class V2_63_UpgradeVersionCommandModule {}
