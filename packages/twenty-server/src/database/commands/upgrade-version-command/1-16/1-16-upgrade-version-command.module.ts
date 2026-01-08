import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UpdateTaskOnDeleteActionCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-update-task-on-delete-action.command';
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
  providers: [UpdateTaskOnDeleteActionCommand],
  exports: [UpdateTaskOnDeleteActionCommand],
})
export class V1_16_UpgradeVersionCommandModule {}
