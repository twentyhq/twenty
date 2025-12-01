import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ViewEntity } from 'typeorm';

import { BackfillViewMainGroupByFieldMetadataIdCommand } from 'src/database/commands/upgrade-version-command/1-13/1-13-backfill-view-main-group-by-field-metadata-id.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity, ViewEntity, ViewGroupEntity]),
    WorkspaceSchemaManagerModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    ApplicationModule,
    FieldMetadataModule,
    DataSourceModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [BackfillViewMainGroupByFieldMetadataIdCommand],
  exports: [BackfillViewMainGroupByFieldMetadataIdCommand],
})
export class V1_13_UpgradeVersionCommandModule {}
