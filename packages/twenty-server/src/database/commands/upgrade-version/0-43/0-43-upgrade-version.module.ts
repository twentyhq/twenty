import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StandardizationOfActorCompositeContextTypeCommand } from 'src/database/commands/upgrade-version/0-42/0-42-standardization-of-actor-composite-context-type';
import { AddTasksAssignedToMeViewCommand } from 'src/database/commands/upgrade-version/0-43/0-43-add-tasks-assigned-to-me-view.command';
import { MigrateSearchVectorOnNoteAndTaskEntitiesCommand } from 'src/database/commands/upgrade-version/0-43/0-43-migrate-search-vector-on-note-and-task-entities.command';
import { UpdateDefaultViewRecordOpeningOnWorkflowObjectsCommand } from 'src/database/commands/upgrade-version/0-43/0-43-update-default-view-record-opening-on-workflow-objects.command';
import { UpgradeTo0_43Command } from 'src/database/commands/upgrade-version/0-43/0-43-upgrade-version.command';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SearchModule } from 'src/engine/metadata-modules/search/search.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, FeatureFlag], 'core'),
    TypeOrmModule.forFeature(
      [ObjectMetadataEntity, FieldMetadataEntity],
      'metadata',
    ),
    SearchModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceMigrationModule,
    WorkspaceMetadataVersionModule,
  ],
  providers: [
    UpgradeTo0_43Command,
    AddTasksAssignedToMeViewCommand,
    MigrateSearchVectorOnNoteAndTaskEntitiesCommand,
    UpdateDefaultViewRecordOpeningOnWorkflowObjectsCommand,
    StandardizationOfActorCompositeContextTypeCommand,
  ],
})
export class UpgradeTo0_43CommandModule {}
