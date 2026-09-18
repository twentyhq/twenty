import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.42.0', 1789719131001)
@Command({
  name: 'upgrade:2-42:backfill-workflow-execution-core-ids',
  description:
    'Validate durable workflow mappings and backfill workflow run core ids',
})
export class BackfillWorkflowExecutionCoreIdsCommand extends ProvisionedWorkspaceCommandRunner {
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

    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      const schema = getWorkspaceSchemaName(workspaceId);

      if (!(await queryRunner.hasTable(`${schema}.workflowVersion`))) {
        this.logger.log(`Workflow version table absent in workspace ${workspaceId}, skipping backfill`);

        return;
      }

      if (!(await this.hasRequiredColumns(queryRunner, schema))) {
        throw new Error(`Workflow execution schema is not ready in workspace ${workspaceId}`);
      }

      await queryRunner.startTransaction();

      const invalidMappings = await queryRunner.query(
        `SELECT wv.id FROM "${schema}"."workflowVersion" wv
         LEFT JOIN core."workflowVersion" cv ON cv.id = wv."coreWorkflowVersionId"
         LEFT JOIN core."workflow" cw ON cw.id = cv."coreWorkflowId"
         WHERE (wv."deletedAt" IS NULL OR cv.id IS NOT NULL) AND (
           cv.id IS NULL OR cv."workspaceId" <> $1 OR
           cv."workflowId" IS DISTINCT FROM wv."workflowId" OR
           cw.id IS NULL OR cw."workspaceId" <> $1 OR
           cw."workspaceWorkflowId" IS DISTINCT FROM wv."workflowId" OR
           cv."workspaceWorkflowVersionId" IS DISTINCT FROM wv.id
         ) LIMIT 1`,
        [workspaceId],
      );
      const duplicates = await queryRunner.query(
        `SELECT wv."coreWorkflowVersionId" FROM "${schema}"."workflowVersion" wv
         JOIN core."workflowVersion" cv ON cv.id = wv."coreWorkflowVersionId" AND cv."workspaceId" = $1
         GROUP BY wv."coreWorkflowVersionId" HAVING count(*) > 1 LIMIT 1`,
        [workspaceId],
      );

      if (invalidMappings.length > 0 || duplicates.length > 0) {
        throw new Error(`Missing or conflicting workflow version mapping in workspace ${workspaceId}`);
      }

      const conflictingRuns = await queryRunner.query(
        `SELECT r.id FROM "${schema}"."workflowRun" r
         LEFT JOIN core."workflowVersion" cv
           ON cv."workspaceId" = $1 AND cv."workspaceWorkflowVersionId" = r."workflowVersionId"
         LEFT JOIN core."workflow" cw
           ON cw."workspaceId" = $1 AND cw."workspaceWorkflowId" = r."workflowId"
         WHERE (r."coreWorkflowVersionId" IS NOT NULL AND cv.id IS NOT NULL AND r."coreWorkflowVersionId" <> cv.id)
            OR (r."coreWorkflowId" IS NOT NULL AND cw.id IS NOT NULL AND r."coreWorkflowId" <> cw.id)
            OR (cv.id IS NOT NULL AND cw.id IS NOT NULL AND cv."coreWorkflowId" <> cw.id)
         LIMIT 1`,
        [workspaceId],
      );

      if (conflictingRuns.length > 0) {
        throw new Error(`Conflicting workflow run core ids in workspace ${workspaceId}`);
      }

      await queryRunner.query(
        `UPDATE "${schema}"."workflowRun" r
         SET "coreWorkflowVersionId" = cv.id
         FROM core."workflowVersion" cv
         WHERE cv."workspaceId" = $1 AND cv."workspaceWorkflowVersionId" = r."workflowVersionId"
           AND r."coreWorkflowVersionId" IS NULL`,
        [workspaceId],
      );
      await queryRunner.query(
        `UPDATE "${schema}"."workflowRun" r
         SET "coreWorkflowId" = cv."coreWorkflowId"
         FROM core."workflowVersion" cv
         WHERE cv."workspaceId" = $1 AND cv.id = r."coreWorkflowVersionId"
           AND r."coreWorkflowId" IS NULL`,
        [workspaceId],
      );
      await queryRunner.query(
        `UPDATE "${schema}"."workflowRun" r
         SET "coreWorkflowId" = cw.id
         FROM core."workflow" cw
         WHERE cw."workspaceId" = $1 AND cw."workspaceWorkflowId" = r."workflowId"
           AND r."coreWorkflowId" IS NULL`,
        [workspaceId],
      );

      const unmappedPendingRuns = await queryRunner.query(
        `SELECT r.id FROM "${schema}"."workflowRun" r
         LEFT JOIN core."workflowVersion" cv ON cv.id = r."coreWorkflowVersionId" AND cv."workspaceId" = $1
         LEFT JOIN core."workflow" cw ON cw.id = r."coreWorkflowId" AND cw."workspaceId" = $1
         WHERE r."deletedAt" IS NULL AND r.status IN ('NOT_STARTED', 'ENQUEUED', 'RUNNING')
           AND (cv.id IS NULL OR cw.id IS NULL OR cv."coreWorkflowId" <> cw.id)
         LIMIT 1`,
        [workspaceId],
      );

      if (unmappedPendingRuns.length > 0) {
        throw new Error(`Pending workflow runs have no valid core mapping in workspace ${workspaceId}`);
      }

      const conflictingPublishedVersions = await queryRunner.query(
        `SELECT cw.id FROM core."workflow" cw
         LEFT JOIN core."workflowVersion" cv ON cv."workspaceId" = cw."workspaceId"
           AND cv."workspaceWorkflowVersionId" = cw."lastPublishedVersionId"
         WHERE cw."workspaceId" = $1 AND cw."lastPublishedVersionId" IS NOT NULL
           AND (cv.id IS NULL OR cv."coreWorkflowId" <> cw.id OR
             (cw."lastPublishedCoreWorkflowVersionId" IS NOT NULL AND cw."lastPublishedCoreWorkflowVersionId" <> cv.id))
         LIMIT 1`,
        [workspaceId],
      );

      if (conflictingPublishedVersions.length > 0) {
        throw new Error(`Invalid published core version mapping in workspace ${workspaceId}`);
      }

      await queryRunner.query(
        `UPDATE core."workflow" cw SET "lastPublishedCoreWorkflowVersionId" = cv.id
         FROM core."workflowVersion" cv
         WHERE cw."workspaceId" = $1 AND cv."workspaceId" = $1
           AND cv."workspaceWorkflowVersionId" = cw."lastPublishedVersionId"
           AND cv."coreWorkflowId" = cw.id AND cw."lastPublishedCoreWorkflowVersionId" IS NULL`,
        [workspaceId],
      );

      if (options.dryRun) {
        await queryRunner.rollbackTransaction();
        this.logger.log(`[DRY RUN] Workflow execution mappings validated in workspace ${workspaceId}`);
      } else {
        await queryRunner.commitTransaction();
        await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
          'workflowAutomatedTriggerMaps',
        ]);
        this.logger.log(`Workflow execution mappings backfilled in workspace ${workspaceId}`);
      }
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async hasRequiredColumns(
    queryRunner: QueryRunner,
    schema: string,
  ): Promise<boolean> {
    const rows = await queryRunner.query(
      `SELECT count(*)::int AS count
       FROM information_schema.columns
       WHERE (table_schema = 'core' AND table_name = 'workflowVersion' AND column_name = 'workspaceWorkflowVersionId')
          OR (table_schema = $1 AND table_name = 'workflowVersion' AND column_name = 'coreWorkflowVersionId')
          OR (table_schema = $1 AND table_name = 'workflowRun' AND column_name IN ('coreWorkflowId', 'coreWorkflowVersionId'))`,
      [schema],
    );

    return rows[0]?.count === 4;
  }
}
