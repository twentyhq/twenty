import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StandardizeRelationFilterSyntaxCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-standardize-relation-filter-syntax';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature([FieldMetadataEntity], 'metadata'),
    WorkspaceDataSourceModule,
  ],
  providers: [StandardizeRelationFilterSyntaxCommand],
  exports: [StandardizeRelationFilterSyntaxCommand],
})
export class V0_54_UpgradeVersionCommandModule {}
