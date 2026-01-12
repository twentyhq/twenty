import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillOpportunityOwnerFieldCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-backfill-opportunity-owner-field.command';
import { BackfillStandardPageLayoutsCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-backfill-standard-page-layouts.command';
import { IdentifyFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-field-metadata.command';
import { IdentifyObjectMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-object-metadata.command';
import { MakeFieldMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-field-metadata-universal-identifier-and-application-id-not-nullable-migration.command';
import { UpdateTaskOnDeleteActionCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-update-task-on-delete-action.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { GlobalWorkspaceDataSourceModule } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { TwentyStandardApplicationModule } from 'src/engine/workspace-manager/twenty-standard-application/twenty-standard-application.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      FieldMetadataEntity,
      ObjectMetadataEntity,
    ]),
    DataSourceModule,
    WorkspaceCacheModule,
    FieldMetadataModule,
    ApplicationModule,
    GlobalWorkspaceDataSourceModule,
    TwentyStandardApplicationModule,
    WorkspaceMigrationModule,
  ],
  providers: [
    UpdateTaskOnDeleteActionCommand,
    BackfillOpportunityOwnerFieldCommand,
    BackfillStandardPageLayoutsCommand,
    IdentifyFieldMetadataCommand,
    IdentifyObjectMetadataCommand,
    MakeFieldMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
  ],
  exports: [
    UpdateTaskOnDeleteActionCommand,
    BackfillOpportunityOwnerFieldCommand,
    BackfillStandardPageLayoutsCommand,
    IdentifyFieldMetadataCommand,
    IdentifyObjectMetadataCommand,
    MakeFieldMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
  ],
})
export class V1_16_UpgradeVersionCommandModule {}
