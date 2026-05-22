import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillCreateRecordCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-8/2-8-workspace-command-1799000000000-backfill-create-record-command-menu-items.command';
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
  providers: [BackfillCreateRecordCommandMenuItemsCommand],
})
export class V2_8_UpgradeVersionCommandModule {}
