import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddWorkspaceForeignKeysMigrationCommand } from 'src/database/commands/upgrade-version-command/1-15/1-15-add-workspace-foreign-keys-migration.command';
import { BackfillUpdatedByFieldCommand } from 'src/database/commands/upgrade-version-command/1-15/1-15-backfill-updated-by-field.command';
import { FixNanPositionValuesInNotesCommand } from 'src/database/commands/upgrade-version-command/1-15/1-15-fix-nan-position-values-in-notes.command';
import { MigratePageLayoutWidgetConfigurationCommand } from 'src/database/commands/upgrade-version-command/1-15/1-15-migrate-page-layout-widget-configuration.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFieldModule } from 'src/engine/metadata-modules/view-field/view-field.module';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      PageLayoutWidgetEntity,
      ObjectMetadataEntity,
      ViewEntity,
      ViewFieldEntity,
    ]),
    DataSourceModule,
    WorkspaceSchemaManagerModule,
    WorkspaceCacheModule,
    FieldMetadataModule,
    ViewFieldModule,
    ApplicationModule,
  ],
  providers: [
    MigratePageLayoutWidgetConfigurationCommand,
    FixNanPositionValuesInNotesCommand,
    BackfillUpdatedByFieldCommand,
    AddWorkspaceForeignKeysMigrationCommand,
  ],
  exports: [
    MigratePageLayoutWidgetConfigurationCommand,
    FixNanPositionValuesInNotesCommand,
    BackfillUpdatedByFieldCommand,
    AddWorkspaceForeignKeysMigrationCommand,
  ],
})
export class V1_15_UpgradeVersionCommandModule {}
