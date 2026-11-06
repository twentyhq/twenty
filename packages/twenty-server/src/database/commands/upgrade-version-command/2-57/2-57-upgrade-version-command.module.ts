import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddMessageAttachmentTargetCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793876432369-add-message-attachment-target.command';
import { AddMessageDeliveryStatusCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793985518738-add-message-delivery-status.command';
import { AddMessageReactionObjectCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793986910990-add-message-reaction-object.command';
import { DropUndeclaredKeysFromCreateAndUpsertRecordsCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793954288001-drop-undeclared-keys-from-create-and-upsert-records.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    FeatureFlagModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    AddMessageAttachmentTargetCommand,
    DropUndeclaredKeysFromCreateAndUpsertRecordsCommand,
    AddMessageDeliveryStatusCommand,
    AddMessageReactionObjectCommand,
  ],
})
export class V2_57_UpgradeVersionCommandModule {}
