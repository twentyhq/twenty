import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { SyncCommandMenuItemAvailabilityExpressionsCommand } from 'src/database/commands/upgrade-version-command/2-7/2-7-workspace-command-1798000020000-sync-command-menu-item-availability-expressions.command';
import { DropFavoriteObjectsCommand } from 'src/database/commands/upgrade-version-command/2-7/2-7-workspace-command-1798000030000-drop-favorite-objects.command';
import { DropConnectedAccountStandardObjectCommand } from 'src/database/commands/upgrade-version-command/2-7/2-7-workspace-command-1798000040000-drop-connected-account-standard-object.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    ObjectMetadataModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    DropFavoriteObjectsCommand,
    SyncCommandMenuItemAvailabilityExpressionsCommand,
    DropConnectedAccountStandardObjectCommand,
  ],
})
export class V2_7_UpgradeVersionCommandModule {}
