import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WORKFLOW_RUN_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

@Command({
  name: 'upgrade:1-1:add-enqueued-status-to-workflow-run',
  description: 'Add enqueued status to workflow run',
})
export class AddEnqueuedStatusToWorkflowRunCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(FieldMetadataEntity, 'core')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Adding enqueued status to workflow run for workspace ${workspaceId}`,
    );

    const workflowRunStatusFieldMetadata =
      await this.fieldMetadataRepository.findOne({
        where: {
          standardId: WORKFLOW_RUN_STANDARD_FIELD_IDS.status,
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

    // check if enqueued status is already in the field metadata options
    if (
      workflowRunStatusFieldMetadataOptions?.some(
        (option) => option.value === WorkflowRunStatus.ENQUEUED,
      )
    ) {
      this.logger.log(
        `Workflow run status field metadata options already contain enqueued status for workspace ${workspaceId}`,
      );

      return;
    } else if (options.dryRun) {
      this.logger.log(
        `Would add enqueued status to workflow run status field metadata for workspace ${workspaceId}`,
      );
    } else {
      workflowRunStatusFieldMetadataOptions?.push({
        value: WorkflowRunStatus.ENQUEUED,
        label: 'Enqueued',
        position: 4,
        color: 'blue',
      });

      await this.fieldMetadataRepository.save(workflowRunStatusFieldMetadata);

      this.logger.log(
        `Enqueued status added to workflow run status field metadata for workspace ${workspaceId}`,
      );
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);

    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();

    if (options.dryRun) {
      this.logger.log(
        `Would try to add enqueued status to workflow run status enum for workspace ${workspaceId}`,
      );
    } else {
      try {
        await mainDataSource.query(
          `ALTER TYPE ${schemaName}."workflowRun_status_enum" ADD VALUE 'ENQUEUED'`,
        );
        this.logger.log(
          `Enqueued status added to workflow run status enum for workspace ${workspaceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Error adding enqueued status to workflow run status enum for workspace ${workspaceId}: ${error}`,
        );
      }
    }
  }
}
