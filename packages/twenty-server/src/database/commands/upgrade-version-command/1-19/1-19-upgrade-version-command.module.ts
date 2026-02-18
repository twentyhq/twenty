import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillSystemFieldsIsSystemCommand } from 'src/database/commands/upgrade-version-command/1-19/1-19-backfill-system-fields-is-system.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    DataSourceModule,
    WorkspaceCacheModule,
    WorkspaceCacheStorageModule,
    WorkspaceMetadataVersionModule,
  ],
  providers: [BackfillSystemFieldsIsSystemCommand],
  exports: [BackfillSystemFieldsIsSystemCommand],
})
export class V1_19_UpgradeVersionCommandModule {}
