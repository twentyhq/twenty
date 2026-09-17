import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { UnpinCreationCommandsOnRecordSelectionCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789634112046-unpin-creation-commands-on-record-selection.command';
import { RelinkWorkflowVersionsToCoreWorkflowsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789645879295-relink-workflow-versions-to-core-workflows.command';
import { RestoreRichTextTypeOnNoteAndTaskBodyCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789652800000-restore-rich-text-type-on-note-and-task-body.command';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldMetadataEntity]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceSchemaMigrationRunnerActionHandlersModule,
  ],
  providers: [
    UnpinCreationCommandsOnRecordSelectionCommand,
    RelinkWorkflowVersionsToCoreWorkflowsCommand,
    RestoreRichTextTypeOnNoteAndTaskBodyCommand,
  ],
  exports: [RelinkWorkflowVersionsToCoreWorkflowsCommand],
})
export class V2_42_UpgradeVersionCommandModule {}
