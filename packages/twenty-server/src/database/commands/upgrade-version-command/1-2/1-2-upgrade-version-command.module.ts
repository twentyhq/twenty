import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddEnqueuedStatusToWorkflowRunCommand } from 'src/database/commands/upgrade-version-command/1-2/1-2-add-enqueued-status-to-workflow-run.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, FieldMetadataEntity], 'core'),
    WorkspaceDataSourceModule,
  ],
  providers: [AddEnqueuedStatusToWorkflowRunCommand],
  exports: [AddEnqueuedStatusToWorkflowRunCommand],
})
export class V1_2_UpgradeVersionCommandModule {}
