import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { DropChannelStandardObjectsCommand } from 'src/database/commands/upgrade-version-command/2-8/2-8-workspace-command-1798000050000-drop-channel-standard-objects.command';
import { BackfillRelationJoinColumnIndexesCommand } from 'src/database/commands/upgrade-version-command/2-8/2-8-workspace-command-1798100000000-backfill-relation-join-column-indexes.command';
import { BackfillCreateRecordCommandMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-8/2-8-workspace-command-1799000000000-backfill-create-record-command-menu-items.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    ObjectMetadataModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [
    DropChannelStandardObjectsCommand,
    BackfillRelationJoinColumnIndexesCommand,
    BackfillCreateRecordCommandMenuItemsCommand,
  ],
})
export class V2_8_UpgradeVersionCommandModule {}
