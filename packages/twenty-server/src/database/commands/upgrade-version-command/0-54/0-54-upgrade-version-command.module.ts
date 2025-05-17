import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CleanNotFoundFilesCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-clean-not-found-files.command';
import { FixStandardSelectFieldsPositionCommand } from 'src/database/commands/upgrade-version-command/0-54/0-54-fix-standard-select-fields-position.command';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';

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
    FileModule,
  ],
  providers: [
    FixStandardSelectFieldsPositionCommand,
    CleanNotFoundFilesCommand,
  ],
  exports: [FixStandardSelectFieldsPositionCommand, CleanNotFoundFilesCommand],
})
export class V0_54_UpgradeVersionCommandModule {}
