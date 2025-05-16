import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FixStandardSelectFieldsPositionCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-fix-standard-select-fields-position.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';
import { FixCreatedByDefaultValueCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-created-by-default-value.command';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature(
      [FieldMetadataEntity, ObjectMetadataEntity],
      'metadata',
    ),
    WorkspaceDataSourceModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceMetadataVersionModule,
  ],
  providers: [
    FixStandardSelectFieldsPositionCommand,
    FixCreatedByDefaultValueCommand,
  ],
  exports: [
    FixStandardSelectFieldsPositionCommand,
    FixCreatedByDefaultValueCommand,
  ],
})
export class V0_54_UpgradeVersionCommandModule {}
