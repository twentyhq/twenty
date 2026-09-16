import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RestoreRichTextTypeOnNoteAndTaskBodyCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789593400000-restore-rich-text-type-on-note-and-task-body.command';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldMetadataEntity]),
    WorkspaceIteratorModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [RestoreRichTextTypeOnNoteAndTaskBodyCommand],
})
export class V2_42_UpgradeVersionCommandModule {}
