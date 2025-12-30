import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddWorkspaceForeignKeysMigrationCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-add-workspace-foreign-keys-migration.command';
import { BackfillUpdatedByFieldCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-backfill-updated-by-field.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFieldModule } from 'src/engine/metadata-modules/view-field/view-field.module';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceEntity,
      ObjectMetadataEntity,
      ViewEntity,
      ViewFieldEntity,
    ]),
    DataSourceModule,
    FieldMetadataModule,
    ViewFieldModule,
    WorkspaceCacheModule,
    ApplicationModule,
  ],
  providers: [BackfillUpdatedByFieldCommand, AddWorkspaceForeignKeysMigrationCommand],
  exports: [BackfillUpdatedByFieldCommand, AddWorkspaceForeignKeysMigrationCommand],
})
export class V1_16_UpgradeVersionCommandModule {}
