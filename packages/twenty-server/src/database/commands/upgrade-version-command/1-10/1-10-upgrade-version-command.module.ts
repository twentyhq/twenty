import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RegenerateSearchVectorsCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-regenerate-search-vectors.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workspace,
      ObjectMetadataEntity,
      FieldMetadataEntity,
      IndexMetadataEntity,
    ]),
    WorkspaceSchemaManagerModule,
  ],
  providers: [RegenerateSearchVectorsCommand],
  exports: [RegenerateSearchVectorsCommand],
})
export class V1_10_UpgradeVersionCommandModule {}
