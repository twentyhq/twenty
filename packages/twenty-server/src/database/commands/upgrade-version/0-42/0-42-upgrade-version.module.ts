import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FixBodyV2ViewFieldPositionCommand } from 'src/database/commands/upgrade-version/0-42/0-42-fix-body-v2-view-field-position.command';
import { LimitAmountOfViewFieldCommand } from 'src/database/commands/upgrade-version/0-42/0-42-limit-amount-of-view-field';
import { MigrateRichTextFieldCommand } from 'src/database/commands/upgrade-version/0-42/0-42-migrate-rich-text-field.command';
import { StandardizationOfActorCompositeContextTypeCommand } from 'src/database/commands/upgrade-version/0-42/0-42-standardization-of-actor-composite-context-type';
import { UpgradeTo0_42Command } from 'src/database/commands/upgrade-version/0-42/0-42-upgrade-version.command';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceSyncMetadataCommandsModule } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/workspace-sync-metadata-commands.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, FeatureFlag], 'core'),
    TypeOrmModule.forFeature(
      [ObjectMetadataEntity, FieldMetadataEntity],
      'metadata',
    ),
    WorkspaceSyncMetadataCommandsModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceMigrationModule,
    WorkspaceMetadataVersionModule,
    WorkspaceDataSourceModule,
    FeatureFlagModule,
  ],
  providers: [
    UpgradeTo0_42Command,
    MigrateRichTextFieldCommand,
    FixBodyV2ViewFieldPositionCommand,
    LimitAmountOfViewFieldCommand,
    StandardizationOfActorCompositeContextTypeCommand,
  ],
})
export class UpgradeTo0_42CommandModule {}
