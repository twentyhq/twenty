import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddKanbanViewIntegrityConstraintMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-add-kanban-view-integrity-constraint-migration.command';
import { BackfillOpportunityOwnerFieldCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-backfill-opportunity-owner-field.command';
import { BackfillStandardPageLayoutsCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-backfill-standard-page-layouts.command';
import { FixKanbanViewIntegrityCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-fix-kanban-view-integrity.command';
import { IdentifyFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-field-metadata.command';
import { IdentifyObjectMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-object-metadata.command';
import { IdentifyViewFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-view-field-metadata.command';
import { IdentifyViewMetadataCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-identify-view-metadata.command';
import { MakeFieldMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-field-metadata-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeObjectMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-object-metadata-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeViewFieldUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-view-field-universal-identifier-and-application-id-not-nullable-migration.command';
import { MakeViewUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-make-view-universal-identifier-and-application-id-not-nullable-migration.command';
import { UpdateTaskOnDeleteActionCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-update-task-on-delete-action.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
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
      ViewEntity,
      ViewFieldEntity,
    ]),
    DataSourceModule,
    WorkspaceCacheModule,
    FieldMetadataModule,
    ApplicationModule,
    GlobalWorkspaceDataSourceModule,
    TwentyStandardApplicationModule,
    WorkspaceMigrationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    UpdateTaskOnDeleteActionCommand,
    BackfillOpportunityOwnerFieldCommand,
    BackfillStandardPageLayoutsCommand,
    IdentifyFieldMetadataCommand,
    IdentifyObjectMetadataCommand,
    IdentifyViewMetadataCommand,
    IdentifyViewFieldMetadataCommand,
    MakeFieldMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeObjectMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeViewUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeViewFieldUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    FixKanbanViewIntegrityCommand,
    AddKanbanViewIntegrityConstraintMigrationCommand,
  ],
  exports: [
    UpdateTaskOnDeleteActionCommand,
    BackfillOpportunityOwnerFieldCommand,
    BackfillStandardPageLayoutsCommand,
    IdentifyFieldMetadataCommand,
    IdentifyObjectMetadataCommand,
    IdentifyViewMetadataCommand,
    IdentifyViewFieldMetadataCommand,
    MakeFieldMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeObjectMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeViewUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    MakeViewFieldUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    FixKanbanViewIntegrityCommand,
    AddKanbanViewIntegrityConstraintMigrationCommand,
  ],
})
export class V1_16_UpgradeVersionCommandModule {}
