import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UpdateStandardIndexViewNamesCommand } from 'src/database/commands/upgrade-version-command/1-21/1-21-update-standard-index-view-names.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    DataSourceModule,
    WorkspaceCacheStorageModule,
    WorkspaceMetadataVersionModule,
  ],
  providers: [UpdateStandardIndexViewNamesCommand],
  exports: [UpdateStandardIndexViewNamesCommand],
})
export class V1_21_UpgradeVersionCommandModule {}
