import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeduplicateUniqueFieldsCommand } from 'src/database/commands/upgrade-version-command/1-7/1-7-deduplicate-unique-fields.command';
import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { IndexMetadataModule } from 'src/engine/metadata-modules/index-metadata/index-metadata.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workspace,
      FieldMetadataEntity,
      ObjectMetadataEntity,
      ViewEntity,
      ViewFieldEntity,
      IndexMetadataEntity,
    ]),
    WorkspaceDataSourceModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceSchemaManagerModule,
    IndexMetadataModule,
    WorkspaceMigrationModule,
    WorkspaceMetadataVersionModule,
  ],
  providers: [DeduplicateUniqueFieldsCommand],
  exports: [DeduplicateUniqueFieldsCommand],
})
export class V1_7_UpgradeVersionCommandModule {}
