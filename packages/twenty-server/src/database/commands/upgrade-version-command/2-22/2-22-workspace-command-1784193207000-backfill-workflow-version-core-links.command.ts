import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { EntityMetadataNotFoundError } from 'typeorm/error/EntityMetadataNotFoundError';
import { v4 as uuidv4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

// Full rebuild of the core workflowVersion rows for a workspace once
// coreWorkflowVersionId is provisioned. Per workspace, in one transaction:
// wipe every core row (clearing all pre-soft-ref / stale-id leftovers), insert
// a fresh own-id row for every workspace version, and write that id back onto
// the workspace record. Because it re-links every record, no version is left
// pointing at a deleted core row, so the dual-write's update path stays correct.
@RegisteredWorkspaceCommand('2.22.0', 1784193207000)
@Command({
  name: 'upgrade:2-22:backfill-workflow-version-core-links',
  description:
    'Rebuild core workflowVersion rows for each workspace and link every workspace record via coreWorkflowVersionId',
})
export class BackfillWorkflowVersionCoreLinksCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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

    let workspaceWorkflowVersions: WorkflowVersionWorkspaceEntity[];

    try {
      const workflowVersionRepository =
        dataSource.getRepository<WorkflowVersionWorkspaceEntity>(
          'workflowVersion',
          { shouldBypassPermissionChecks: true },
        );

      workspaceWorkflowVersions = await workflowVersionRepository.find();
    } catch (error) {
      if (error instanceof EntityMetadataNotFoundError) {
        this.logger.log(
          `workflowVersion object does not exist for workspace ${workspaceId}, skipping`,
        );

        return;
      }

      throw error;
    }

    if (options.dryRun === true) {
      this.logger.log(
        `[DRY RUN] Would rebuild ${workspaceWorkflowVersions.length} core workflowVersion row(s) for workspace ${workspaceId}`,
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
          `DELETE FROM core."workflowVersion" WHERE "workspaceId" = $1`,
          [workspaceId],
        );

        for (const workflowVersion of workspaceWorkflowVersions) {
          const coreWorkflowVersionId = uuidv4();

          await queryRunner.query(
            `INSERT INTO core."workflowVersion"
               (id, "workspaceId", "universalIdentifier", "applicationId", triggers, steps, status, "workflowId")
             VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8)`,
            [
              coreWorkflowVersionId,
              workspaceId,
              uuidv4(),
              applicationId,
              isDefined(workflowVersion.trigger)
                ? JSON.stringify([workflowVersion.trigger])
                : null,
              isDefined(workflowVersion.steps)
                ? JSON.stringify(workflowVersion.steps)
                : null,
              workflowVersion.status,
              workflowVersion.workflowId,
            ],
          );

          await queryRunner.query(
            `UPDATE "${schema}"."workflowVersion" SET "coreWorkflowVersionId" = $1 WHERE id = $2`,
            [coreWorkflowVersionId, workflowVersion.id],
          );
        }

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();

        throw error;
      }

      // The old sync path invalidated workflowAutomatedTriggerMaps; the raw-SQL
      // rebuild bypasses it, so recompute it from the fresh core rows.
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'workflowAutomatedTriggerMaps',
      ]);

      this.logger.log(
        `Rebuilt ${workspaceWorkflowVersions.length} core workflowVersion row(s) for workspace ${workspaceId}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
