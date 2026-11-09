import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddMessageAttachmentTargetCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793876432369-add-message-attachment-target.command';
import { BackfillFieldMetadataOptionsCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1794142104606-backfill-field-metadata-options.command';
import { DropUndeclaredKeysFromCreateAndUpsertRecordsCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793954288001-drop-undeclared-keys-from-create-and-upsert-records.command';
import { BackfillApplicationGrantRolesCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1794155089946-backfill-application-grant-roles.command';
import { BackfillCanCreatePermissionsCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793995651000-backfill-can-create-permissions.command';
import { MoveFindRecordsSortsToRecordSortsCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793965625303-move-find-records-sorts-to-record-sorts.command';
import { ReadCreatePermissionInCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1794037630000-read-create-permission-in-command-menu-items.command';
import { RecomputeRolesPermissionsWithFieldListsCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1794163150000-recompute-roles-permissions-with-field-lists.command';
import { RecomputeRolesPermissionsWithCreateKeysCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1794045345000-recompute-roles-permissions-with-create-keys.command';
import { EnablePrivateRecordsForSharingWorkspacesCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1794067670000-enable-private-records-for-sharing-workspaces.command';
import { AddAccessGroupObjectMetadataIdCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1794067568000-add-access-group-object-metadata-id.command';
import { RefreshOutlookDraftsCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1794061333000-refresh-outlook-drafts.command';
import { ReplaceWithdrawnCurrencyCodeCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1794064503000-replace-withdrawn-currency-code.command';
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
    AddAccessGroupObjectMetadataIdCommand,
    AddMessageAttachmentTargetCommand,
    BackfillApplicationGrantRolesCommand,
    BackfillCanCreatePermissionsCommand,
    BackfillFieldMetadataOptionsCommand,
    DropUndeclaredKeysFromCreateAndUpsertRecordsCommand,
    EnablePrivateRecordsForSharingWorkspacesCommand,
    MoveFindRecordsSortsToRecordSortsCommand,
    ReadCreatePermissionInCommandMenuItemsCommand,
    RecomputeRolesPermissionsWithCreateKeysCommand,
    RecomputeRolesPermissionsWithFieldListsCommand,
    RefreshOutlookDraftsCommand,
    ReplaceWithdrawnCurrencyCodeCommand,
  ],
})
export class V2_57_UpgradeVersionCommandModule {}
