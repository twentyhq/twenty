import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddMissingSystemFieldsToStandardObjectsCommand } from 'src/database/commands/upgrade-version-command/1-19/1-19-add-missing-system-fields-to-standard-objects.command';
import { BackfillSystemFieldsIsSystemCommand } from 'src/database/commands/upgrade-version-command/1-19/1-19-backfill-system-fields-is-system.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    DataSourceModule,
    WorkspaceCacheModule,
    WorkspaceCacheStorageModule,
    WorkspaceMetadataVersionModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    BackfillSystemFieldsIsSystemCommand,
    AddMissingSystemFieldsToStandardObjectsCommand,
  ],
  exports: [
    BackfillSystemFieldsIsSystemCommand,
    AddMissingSystemFieldsToStandardObjectsCommand,
  ],
})
export class V1_19_UpgradeVersionCommandModule {}
