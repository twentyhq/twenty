import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WORKFLOW_RUN_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

@Command({
  name: 'upgrade:1-10:add-workflow-run-stop-statuses',
  description: 'Add stopped and stopping statuses to workflow runs',
})
export class AddWorkflowRunStopStatusesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Adding stopped and stopping statuses to workflow runs for workspace ${workspaceId}`,
    );

    const workflowRunStatusFieldMetadata =
      await this.fieldMetadataRepository.findOne({
        where: {
          standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.status,
          workspaceId,
        },
      });

    if (!workflowRunStatusFieldMetadata) {
      this.logger.error(
        `Workflow run status field metadata not found for workspace ${workspaceId}`,
      );

      return;
    }

    const workflowRunStatusFieldMetadataOptions =
      workflowRunStatusFieldMetadata.options;

    if (options.dryRun) {
      this.logger.log(
        `Would add stopped and stopping statuses to workflow run status field metadata for workspace ${workspaceId}`,
      );
    } else {
      const workflowRunStatusFieldMetadataOptionsSpecificStoppingAndStoppedTreatment =
        workflowRunStatusFieldMetadataOptions?.filter(
          (option) =>
            option.value !== WorkflowRunStatus.STOPPED &&
            option.value !== WorkflowRunStatus.STOPPING,
        ) as FieldMetadataComplexOption[];

      workflowRunStatusFieldMetadataOptionsSpecificStoppingAndStoppedTreatment?.push(
        {
          id: v4(),
          value: WorkflowRunStatus.STOPPING,
          label: 'Stopping',
          position: 5,
          color: 'orange',
        },
      );
      workflowRunStatusFieldMetadataOptionsSpecificStoppingAndStoppedTreatment?.push(
        {
          id: v4(),
          value: WorkflowRunStatus.STOPPED,
          label: 'Stopped',
          position: 6,
          color: 'gray',
        },
      );

      await this.fieldMetadataRepository.save({
        ...workflowRunStatusFieldMetadata,
        options:
          workflowRunStatusFieldMetadataOptionsSpecificStoppingAndStoppedTreatment,
      });

      this.logger.log(
        `Stopped and stopping statuses added to workflow run status field metadata for workspace ${workspaceId}`,
      );
    }

    if (
      workflowRunStatusFieldMetadataOptions?.some(
        (option) =>
          option.value === WorkflowRunStatus.STOPPED ||
          option.value === WorkflowRunStatus.STOPPING,
      )
    ) {
      this.logger.log(
        `We do not want to re-run the workspace command for those already added`,
      );

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);

    if (options.dryRun) {
      this.logger.log(
        `Would try to add stopped and stopping statuses to workflow run status enum for workspace ${workspaceId}`,
      );
    } else {
      try {
        await this.coreDataSource.query(
          `ALTER TYPE ${schemaName}."workflowRun_status_enum" ADD VALUE 'STOPPING'`,
        );
        this.logger.log(
          `Stopping status added to workflow run status enum for workspace ${workspaceId}`,
        );
        await this.coreDataSource.query(
          `ALTER TYPE ${schemaName}."workflowRun_status_enum" ADD VALUE 'STOPPED'`,
        );
        this.logger.log(
          `Stopped status added to workflow run status enum for workspace ${workspaceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Error adding stopped and stopping statuses to workflow run status enum for workspace ${workspaceId}: ${error}`,
        );
      }
    }
  }
}
