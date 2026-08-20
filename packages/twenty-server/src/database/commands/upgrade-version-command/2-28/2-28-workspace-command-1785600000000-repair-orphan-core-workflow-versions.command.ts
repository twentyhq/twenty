import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { EntityMetadataNotFoundError } from 'typeorm/error/EntityMetadataNotFoundError';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

// Delete orphan core.workflowVersion rows left by delete/destroy paths that
// predated the transactional core cleanup (< 2.25). An orphan is a core row no
// workspace version references via coreWorkflowVersionId. The NOT EXISTS check
// does not filter deletedAt, so a soft-deleted (restorable) workspace version
// still protects its core row, and it is evaluated at delete time so a version
// created concurrently keeps its core row.
@RegisteredWorkspaceCommand('2.28.0', 1785600000000)
@Command({
  name: 'upgrade:2-28:repair-orphan-core-workflow-versions',
  description:
    'Delete orphan core workflowVersion rows with no workspace referrer',
})
export class RepairOrphanCoreWorkflowVersionsCommand extends ProvisionedWorkspaceCommandRunner {
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
      return;
    }

    try {
      // Resolve the workspace workflowVersion object; EntityMetadataNotFoundError
      // means it was never provisioned, so there is nothing to repair and the
      // orphan query below would fail to resolve its schema table. Skip cleanly
      // like the sibling backfill commands rather than aborting the upgrade.
      await dataSource
        .getRepository<WorkflowVersionWorkspaceEntity>('workflowVersion', {
          shouldBypassPermissionChecks: true,
        })
        .count();
    } catch (error) {
      if (error instanceof EntityMetadataNotFoundError) {
        return;
      }

      throw error;
    }

    const schema = getWorkspaceSchemaName(workspaceId);

    const orphanClause = `
      FROM core."workflowVersion" c
      WHERE c."workspaceId" = $1
        AND NOT EXISTS (
          SELECT 1
          FROM "${schema}"."workflowVersion" wf
          WHERE wf."coreWorkflowVersionId" = c.id
        )`;

    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      const [counts] = await queryRunner.query(
        `SELECT count(*)::int AS total,
                count(*) FILTER (WHERE c.status = 'ACTIVE')::int AS active
         ${orphanClause}`,
        [workspaceId],
      );

      if (counts.total === 0) {
        return;
      }

      if (options.dryRun) {
        this.logger.log(
          `[DRY RUN] Would delete ${counts.total} orphan core workflowVersion row(s) (${counts.active} ACTIVE) for workspace ${workspaceId}`,
        );

        return;
      }

      await queryRunner.startTransaction();

      try {
        await queryRunner.query(`DELETE ${orphanClause}`, [workspaceId]);

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();

        throw error;
      }

      this.logger.log(
        `Deleted ${counts.total} orphan core workflowVersion row(s) (${counts.active} ACTIVE) for workspace ${workspaceId}`,
      );

      // The raw delete bypasses the sync path that normally invalidates the
      // automated trigger map, which is built from ACTIVE core versions, so
      // recompute it only when an ACTIVE orphan was removed.
      if (counts.active > 0) {
        await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
          'workflowAutomatedTriggerMaps',
        ]);
      }
    } finally {
      await queryRunner.release();
    }
  }
}
