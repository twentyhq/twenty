import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillWorkflowNextStepIdsCommand } from 'src/database/commands/upgrade-version-command/0-53/0-53-backfill-workflow-next-step-ids.command';
import { CopyTypeormMigrationsCommand } from 'src/database/commands/upgrade-version-command/0-53/0-53-copy-typeorm-migrations.command';
import { FixStandardSelectFieldsPositionCommand } from 'src/database/commands/upgrade-version-command/0-53/0-53-fix-standard-select-fields-position.command';
import { MigrateWorkflowEventListenersToAutomatedTriggersCommand } from 'src/database/commands/upgrade-version-command/0-53/0-53-migrate-workflow-event-listeners-to-automated-triggers.command';
import { RemoveRelationForeignKeyFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/0-53/0-53-remove-relation-foreign-key-field-metadata.command';
import { UpgradeSearchVectorOnPersonEntityCommand } from 'src/database/commands/upgrade-version-command/0-53/0-53-upgrade-search-vector-on-person-entity.command';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SearchVectorModule } from 'src/engine/metadata-modules/search-vector/search-vector.module';
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
    SearchVectorModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceMetadataVersionModule,
    FeatureFlagModule,
  ],
  providers: [
    MigrateWorkflowEventListenersToAutomatedTriggersCommand,
    CopyTypeormMigrationsCommand,
    BackfillWorkflowNextStepIdsCommand,
    RemoveRelationForeignKeyFieldMetadataCommand,
    UpgradeSearchVectorOnPersonEntityCommand,
    FixStandardSelectFieldsPositionCommand,
  ],
  exports: [
    MigrateWorkflowEventListenersToAutomatedTriggersCommand,
    RemoveRelationForeignKeyFieldMetadataCommand,
    BackfillWorkflowNextStepIdsCommand,
    CopyTypeormMigrationsCommand,
    UpgradeSearchVectorOnPersonEntityCommand,
    FixStandardSelectFieldsPositionCommand,
  ],
})
export class V0_53_UpgradeVersionCommandModule {}
