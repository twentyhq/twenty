import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddEnqueuedStatusToWorkflowRunV2Command } from 'src/database/commands/upgrade-version-command/1-2/1-2-add-enqueued-status-to-workflow-run-v2.command';
import { AddNextStepIdsToWorkflowVersionTriggers } from 'src/database/commands/upgrade-version-command/1-2/1-2-add-next-step-ids-to-workflow-version-triggers.command';
import { RemoveWorkflowRunsWithoutState } from 'src/database/commands/upgrade-version-command/1-2/1-2-remove-workflow-runs-without-state.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Workspace, FieldMetadataEntity, ObjectMetadataEntity],
      'core',
    ),
    WorkspaceDataSourceModule,
  ],
  providers: [
    RemoveWorkflowRunsWithoutState,
    AddEnqueuedStatusToWorkflowRunV2Command,
    AddNextStepIdsToWorkflowVersionTriggers,
  ],
  exports: [
    RemoveWorkflowRunsWithoutState,
    AddEnqueuedStatusToWorkflowRunV2Command,
    AddNextStepIdsToWorkflowVersionTriggers,
  ],
})
export class V1_2_UpgradeVersionCommandModule {}
