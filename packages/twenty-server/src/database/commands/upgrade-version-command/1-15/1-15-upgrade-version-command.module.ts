import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FixNanPositionValuesInNotesCommand } from 'src/database/commands/upgrade-version-command/1-15/1-15-fix-nan-position-values-in-notes.command';
import { IdentifyFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/1-15/1-15-identify-field-metadata.command';
import { MakeFieldMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand } from 'src/database/commands/upgrade-version-command/1-15/1-15-make-field-metadata-universal-identifier-and-application-id-not-nullable-migration.command';
import { MigratePageLayoutWidgetConfigurationCommand } from 'src/database/commands/upgrade-version-command/1-15/1-15-migrate-page-layout-widget-configuration.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity, PageLayoutWidgetEntity]),
    DataSourceModule,
    WorkspaceSchemaManagerModule,
    WorkspaceCacheModule,
  ],
  providers: [
    MigratePageLayoutWidgetConfigurationCommand,
    FixNanPositionValuesInNotesCommand,
    MakeFieldMetadataUniversalIdentifierAndApplicationIdNotNullableMigrationCommand,
    IdentifyFieldMetadataCommand
  ],
  exports: [
    MigratePageLayoutWidgetConfigurationCommand,
    FixNanPositionValuesInNotesCommand,
  ],
})
export class V1_15_UpgradeVersionCommandModule {}
