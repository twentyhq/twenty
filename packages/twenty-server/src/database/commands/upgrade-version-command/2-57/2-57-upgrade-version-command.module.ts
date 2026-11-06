import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddMessageAttachmentTargetCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793876432369-add-message-attachment-target.command';
import { DropUndeclaredKeysFromCreateAndUpsertRecordsCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793954288001-drop-undeclared-keys-from-create-and-upsert-records.command';
import { MoveFindRecordsSortsToRecordSortsCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793965625303-move-find-records-sorts-to-record-sorts.command';
import { RefreshOutlookDraftsCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793993002000-refresh-outlook-drafts.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageChannelEntity]),
    ApplicationModule,
    FeatureFlagModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    AddMessageAttachmentTargetCommand,
    DropUndeclaredKeysFromCreateAndUpsertRecordsCommand,
    MoveFindRecordsSortsToRecordSortsCommand,
    RefreshOutlookDraftsCommand,
  ],
})
export class V2_57_UpgradeVersionCommandModule {}
