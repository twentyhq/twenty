import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { EntityMetadataNotFoundError } from 'typeorm/error/EntityMetadataNotFoundError';
import { v4 as uuidv4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

// Full rebuild of the core workflow rows for a workspace once
// coreWorkflowId is provisioned. Per workspace, in one transaction:
// wipe every core row (clearing all pre-soft-ref / stale-id leftovers), insert
// a fresh own-id row for every workspace workflow, and write that id back onto
// the workspace record. Because it re-links every record, no workflow is left
// pointing at a deleted core row, so the dual-write's update path stays correct.
@RegisteredWorkspaceCommand('2.23.0', 1784286707000)
@Command({
  name: 'upgrade:2-23:backfill-workflow-core-links',
  description:
    'Rebuild core workflow rows for each workspace and link every workspace record via coreWorkflowId',
})
export class BackfillWorkflowCoreLinksCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.log(
        `No workspace data source for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    let workspaceWorkflows: WorkflowWorkspaceEntity[];

    try {
      const workflowRepository =
        dataSource.getRepository<WorkflowWorkspaceEntity>('workflow', {
          shouldBypassPermissionChecks: true,
        });

      workspaceWorkflows = await workflowRepository.find();
    } catch (error) {
      if (error instanceof EntityMetadataNotFoundError) {
        this.logger.log(
          `workflow object does not exist for workspace ${workspaceId}, skipping`,
        );

        return;
      }

      throw error;
    }

    if (options.dryRun === true) {
      this.logger.log(
        `[DRY RUN] Would rebuild ${workspaceWorkflows.length} core workflow row(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      const [workspace] = await queryRunner.query(
        `SELECT "databaseSchema", "workspaceCustomApplicationId" FROM core."workspace" WHERE id = $1`,
        [workspaceId],
      );

      if (!isDefined(workspace?.workspaceCustomApplicationId)) {
        throw new Error(
          `Workspace custom application not found for workspace ${workspaceId}`,
        );
      }

      const schema: string = workspace.databaseSchema;
      const applicationId: string = workspace.workspaceCustomApplicationId;

      await queryRunner.startTransaction();

      try {
        await queryRunner.query(
          `DELETE FROM core."workflow" WHERE "workspaceId" = $1`,
          [workspaceId],
        );

        for (const workflow of workspaceWorkflows) {
          const coreWorkflowId = uuidv4();

          await queryRunner.query(
            `INSERT INTO core."workflow"
               (id, "workspaceId", "universalIdentifier", "applicationId", name, "lastPublishedVersionId")
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              coreWorkflowId,
              workspaceId,
              uuidv4(),
              applicationId,
              workflow.name ?? null,
              workflow.lastPublishedVersionId || null,
            ],
          );

          await queryRunner.query(
            `UPDATE "${schema}"."workflow" SET "coreWorkflowId" = $1 WHERE id = $2`,
            [coreWorkflowId, workflow.id],
          );
        }

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();

        throw error;
      }

      this.logger.log(
        `Rebuilt ${workspaceWorkflows.length} core workflow row(s) for workspace ${workspaceId}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
