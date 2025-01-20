import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StandardizeVariableViewFilterSyntaxCommand } from 'src/database/commands/upgrade-version/0-41/0-41-standardize-variable-view-filter-syntax.command';
import { UpgradeTo0_41Command } from 'src/database/commands/upgrade-version/0-41/0-41-upgrade-version.command';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature(
      [ObjectMetadataEntity, FieldMetadataEntity, WorkspaceMigrationEntity],
      'metadata',
    ),
    WorkspaceMigrationRunnerModule,
    WorkspaceMigrationModule,
    WorkspaceMetadataVersionModule,
    TypeORMModule,
  ],
  providers: [UpgradeTo0_41Command, StandardizeVariableViewFilterSyntaxCommand],
})
export class UpgradeTo0_41CommandModule {} 