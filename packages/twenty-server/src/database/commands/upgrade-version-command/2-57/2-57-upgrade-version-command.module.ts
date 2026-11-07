import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddMessageAttachmentTargetCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793876432369-add-message-attachment-target.command';
import { DropUndeclaredKeysFromCreateAndUpsertRecordsCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793954288001-drop-undeclared-keys-from-create-and-upsert-records.command';
import { BackfillCanCreatePermissionsCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793995651000-backfill-can-create-permissions.command';
import { MoveFindRecordsSortsToRecordSortsCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793965625303-move-find-records-sorts-to-record-sorts.command';
import { ReadCreatePermissionInCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1794037630000-read-create-permission-in-command-menu-items.command';
import { RecomputeRolesPermissionsWithCreateKeysCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1794045345000-recompute-roles-permissions-with-create-keys.command';
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
    BackfillCanCreatePermissionsCommand,
    DropUndeclaredKeysFromCreateAndUpsertRecordsCommand,
    MoveFindRecordsSortsToRecordSortsCommand,
    ReadCreatePermissionInCommandMenuItemsCommand,
    RecomputeRolesPermissionsWithCreateKeysCommand,
  ],
})
export class V2_57_UpgradeVersionCommandModule {}
