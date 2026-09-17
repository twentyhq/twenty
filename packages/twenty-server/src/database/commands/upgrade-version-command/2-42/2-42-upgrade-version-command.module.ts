import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RestoreRichTextTypeOnNoteAndTaskBodyCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789637700000-restore-rich-text-type-on-note-and-task-body.command';
import { UnpinCreationCommandsOnRecordSelectionCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789634112046-unpin-creation-commands-on-record-selection.command';
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
    RestoreRichTextTypeOnNoteAndTaskBodyCommand,
    UnpinCreationCommandsOnRecordSelectionCommand,
  ],
})
export class V2_42_UpgradeVersionCommandModule {}
