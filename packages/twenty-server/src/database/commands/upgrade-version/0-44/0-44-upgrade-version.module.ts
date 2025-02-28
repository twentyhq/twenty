import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MigrationCommandModule } from 'src/database/commands/migration-command/migration-command.module';
import { MigrateRelationsToFieldMetadataCommand } from 'src/database/commands/upgrade-version/0-44/0-44-migrate-relations-to-field-metadata.command';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    MigrationCommandModule.register('0.44', {
      imports: [
        TypeOrmModule.forFeature([Workspace, FeatureFlag], 'core'),
        TypeOrmModule.forFeature(
          [ObjectMetadataEntity, FieldMetadataEntity],
          'metadata',
        ),
        WorkspaceMigrationRunnerModule,
        WorkspaceMigrationModule,
        WorkspaceMetadataVersionModule,
      ],
      providers: [MigrateRelationsToFieldMetadataCommand],
    }),
  ],
})
export class UpgradeTo0_44CommandModule {}
