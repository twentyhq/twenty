import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillWorkspaceFavoritesCommand } from 'src/database/commands/upgrade-version/0-31/0-31-backfill-workspace-favorites.command';
import { CleanViewsWithDeletedObjectMetadataCommand } from 'src/database/commands/upgrade-version/0-31/0-31-clean-views-with-deleted-object-metadata.command';
import { UpgradeTo0_31Command } from 'src/database/commands/upgrade-version/0-31/0-31-upgrade-version.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceSyncMetadataCommandsModule } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/workspace-sync-metadata-commands.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
    WorkspaceSyncMetadataCommandsModule,
  ],
  providers: [
    UpgradeTo0_31Command,
    BackfillWorkspaceFavoritesCommand,
    CleanViewsWithDeletedObjectMetadataCommand,
  ],
})
export class UpgradeTo0_31CommandModule {}
