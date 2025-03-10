import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddTasksAssignedToMeViewCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-add-tasks-assigned-to-me-view.command';
import { MigrateIsSearchableForCustomObjectMetadataCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-migrate-is-searchable-for-custom-object-metadata.command';
import { MigrateRichTextContentPatchCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-migrate-rich-text-content-patch.command';
import { MigrateSearchVectorOnNoteAndTaskEntitiesCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-migrate-search-vector-on-note-and-task-entities.command';
import { UpdateDefaultViewRecordOpeningOnWorkflowObjectsCommand } from 'src/database/commands/upgrade-version-command/0-43/0-43-update-default-view-record-opening-on-workflow-objects.command';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SearchModule } from 'src/engine/metadata-modules/search/search.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, FeatureFlag], 'core'),
    TypeOrmModule.forFeature(
      [FieldMetadataEntity, ObjectMetadataEntity],
      'metadata',
    ),
    WorkspaceDataSourceModule,
    SearchModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceMetadataVersionModule,
  ],
  providers: [
    MigrateRichTextContentPatchCommand,
    MigrateSearchVectorOnNoteAndTaskEntitiesCommand,
    UpdateDefaultViewRecordOpeningOnWorkflowObjectsCommand,
    MigrateIsSearchableForCustomObjectMetadataCommand,
    AddTasksAssignedToMeViewCommand,
  ],
  exports: [
    MigrateRichTextContentPatchCommand,
    MigrateSearchVectorOnNoteAndTaskEntitiesCommand,
    UpdateDefaultViewRecordOpeningOnWorkflowObjectsCommand,
    MigrateIsSearchableForCustomObjectMetadataCommand,
    AddTasksAssignedToMeViewCommand,
  ],
})
export class V0_43_UpgradeVersionCommandModule {}
