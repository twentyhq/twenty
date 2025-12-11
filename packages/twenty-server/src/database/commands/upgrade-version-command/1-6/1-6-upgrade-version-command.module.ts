import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FixLabelIdentifierPositionAndVisibilityCommand } from 'src/database/commands/upgrade-version-command/1-6/1-6-fix-label-identifier-position-and-visibility.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

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
    WorkspaceDataSourceModule,
    WorkspaceSchemaManagerModule,
    WorkspaceMetadataVersionModule,
  ],
  providers: [FixLabelIdentifierPositionAndVisibilityCommand],
  exports: [FixLabelIdentifierPositionAndVisibilityCommand],
})
export class V1_6_UpgradeVersionCommandModule {}
