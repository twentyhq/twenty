import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildWorkspaceWorkflowVersionIdBackfillPredicate } from 'src/database/commands/upgrade-version-command/2-42/utils/build-workspace-workflow-version-id-backfill-predicate.util';
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
        this.logger.log(
          `Workflow version table absent in workspace ${workspaceId}, skipping backfill`,
        );

        return;
      }

      if (!(await this.hasRequiredColumns(queryRunner, schema))) {
        throw new Error(
          `Workflow execution schema is not ready in workspace ${workspaceId}`,
        );
      }

      await queryRunner.startTransaction();

      if (options.dryRun) {
        await queryRunner.query(
          `UPDATE core."workflowVersion" cv
           SET "workspaceWorkflowVersionId" = wv."id"
           ${buildWorkspaceWorkflowVersionIdBackfillPredicate(schema)}`,
          [workspaceId],
        );
      }

      const invalidMappings: { id: string; reason: string }[] =
        await queryRunner.query(
          `SELECT wv.id, CASE
             WHEN cv.id IS NULL THEN 'missing core version'
             WHEN cv."workspaceWorkflowVersionId" IS DISTINCT FROM wv.id THEN 'version alias mismatch'
             WHEN cv."workflowId" IS DISTINCT FROM wv."workflowId" THEN 'workflow mismatch'
             WHEN cw.id IS NULL THEN 'missing core workflow'
             ELSE 'core workflow mismatch'
           END AS reason
           FROM "${schema}"."workflowVersion" wv
           JOIN "${schema}"."workflow" w ON w.id = wv."workflowId" AND w."deletedAt" IS NULL
           LEFT JOIN core."workflowVersion" cv ON cv.id = wv."coreWorkflowVersionId" AND cv."workspaceId" = $1
           LEFT JOIN core."workflow" cw ON cw.id = cv."coreWorkflowId" AND cw."workspaceId" = $1
           WHERE wv."deletedAt" IS NULL AND (
             cv.id IS NULL OR
             cv."workspaceWorkflowVersionId" IS DISTINCT FROM wv.id OR
             cv."workflowId" IS DISTINCT FROM wv."workflowId" OR
             cw.id IS NULL OR
             cw."workspaceWorkflowId" IS DISTINCT FROM wv."workflowId"
           ) LIMIT 10`,
          [workspaceId],
        );

      if (invalidMappings.length > 0) {
        throw new Error(
          `Missing or conflicting workflow version mapping in workspace ${workspaceId}: ${invalidMappings
            .map(({ id, reason }) => `${id} (${reason})`)
            .join(', ')}`,
        );
      }

      await queryRunner.query(
        `UPDATE "${schema}"."workflowRun" r
         SET "coreWorkflowVersionId" = cv.id
         FROM core."workflowVersion" cv
         WHERE cv."workspaceId" = $1 AND cv."workspaceWorkflowVersionId" = r."workflowVersionId"
           AND NOT EXISTS (
             SELECT 1 FROM core."workflowVersion" stored
             WHERE stored.id = r."coreWorkflowVersionId" AND stored."workspaceId" = $1
           )`,
        [workspaceId],
      );
      await queryRunner.query(
        `UPDATE "${schema}"."workflowRun" r
         SET "coreWorkflowId" = cv."coreWorkflowId"
         FROM core."workflowVersion" cv
         WHERE cv."workspaceId" = $1 AND cv.id = r."coreWorkflowVersionId"
           AND cv."coreWorkflowId" IS NOT NULL
           AND NOT EXISTS (
             SELECT 1 FROM core."workflow" stored
             WHERE stored.id = r."coreWorkflowId" AND stored."workspaceId" = $1
           )`,
        [workspaceId],
      );
      await queryRunner.query(
        `UPDATE "${schema}"."workflowRun" r
         SET "coreWorkflowId" = cw.id
         FROM core."workflow" cw
         WHERE cw."workspaceId" = $1 AND cw."workspaceWorkflowId" = r."workflowId"
           AND NOT EXISTS (
             SELECT 1 FROM core."workflow" stored
             WHERE stored.id = r."coreWorkflowId" AND stored."workspaceId" = $1
           )`,
        [workspaceId],
      );

      const unmappedPendingRuns: { id: string }[] = await queryRunner.query(
        `SELECT r.id FROM "${schema}"."workflowRun" r
         LEFT JOIN core."workflowVersion" cv ON cv.id = r."coreWorkflowVersionId" AND cv."workspaceId" = $1
         LEFT JOIN core."workflow" cw ON cw.id = r."coreWorkflowId" AND cw."workspaceId" = $1
         WHERE r."deletedAt" IS NULL AND r.status IN ('NOT_STARTED', 'ENQUEUED', 'RUNNING')
           AND (cv.id IS NULL OR cw.id IS NULL OR cv."coreWorkflowId" <> cw.id)
         LIMIT 10`,
        [workspaceId],
      );

      if (unmappedPendingRuns.length > 0) {
        throw new Error(
          `Pending workflow runs have no valid core mapping in workspace ${workspaceId}: ${unmappedPendingRuns
            .map(({ id }) => id)
            .join(', ')}`,
        );
      }

      const conflictingPublishedVersions: { id: string }[] =
        await queryRunner.query(
          `SELECT cw.id FROM core."workflow" cw
           JOIN "${schema}"."workflow" w ON w.id = cw."workspaceWorkflowId" AND w."deletedAt" IS NULL
           LEFT JOIN core."workflowVersion" cv ON cv."workspaceId" = cw."workspaceId"
             AND cv."workspaceWorkflowVersionId" = cw."lastPublishedVersionId"
           WHERE cw."workspaceId" = $1 AND cw."lastPublishedVersionId" IS NOT NULL
             AND (cv.id IS NULL OR cv."coreWorkflowId" <> cw.id OR
               (cw."lastPublishedCoreWorkflowVersionId" IS NOT NULL AND cw."lastPublishedCoreWorkflowVersionId" <> cv.id))
           LIMIT 10`,
          [workspaceId],
        );

      if (conflictingPublishedVersions.length > 0) {
        throw new Error(
          `Invalid published core version mapping in workspace ${workspaceId}: ${conflictingPublishedVersions
            .map(({ id }) => id)
            .join(', ')}`,
        );
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
        this.logger.log(
          `[DRY RUN] Workflow execution mappings validated in workspace ${workspaceId}`,
        );
      } else {
        await queryRunner.commitTransaction();
        await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
          'workflowAutomatedTriggerMaps',
        ]);
        this.logger.log(
          `Workflow execution mappings backfilled in workspace ${workspaceId}`,
        );
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
