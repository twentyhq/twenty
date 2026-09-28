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

      const [, createdCoreWorkflowCount] = await queryRunner.query(
        `WITH "createdCoreWorkflows" AS (
           INSERT INTO core."workflow"
             (id, "workspaceId", "universalIdentifier", "applicationId", name, "lastPublishedVersionId", "workspaceWorkflowId")
           SELECT gen_random_uuid(), $1, gen_random_uuid(), workspace."workspaceCustomApplicationId",
             w.name, NULLIF(w."lastPublishedVersionId", '')::uuid, w.id
           FROM "${schema}"."workflow" w
           JOIN core."workspace" workspace ON workspace.id = $1
           WHERE w."deletedAt" IS NULL AND w."coreWorkflowId" IS NULL
             AND NOT EXISTS (
               SELECT 1 FROM core."workflow" existing
               WHERE existing."workspaceId" = $1 AND existing."workspaceWorkflowId" = w.id
             )
           RETURNING id, "workspaceWorkflowId"
         )
         UPDATE "${schema}"."workflow" w
         SET "coreWorkflowId" = "createdCoreWorkflows".id
         FROM "createdCoreWorkflows"
         WHERE w.id = "createdCoreWorkflows"."workspaceWorkflowId"`,
        [workspaceId],
      );

      if (createdCoreWorkflowCount > 0) {
        this.logger.log(
          `${options.dryRun ? '[DRY RUN] Would create' : 'Created'} ${createdCoreWorkflowCount} missing core workflow(s) in workspace ${workspaceId}`,
        );
      }

      const [, relinkedCoreVersionCount] = await queryRunner.query(
        `UPDATE core."workflowVersion" cv
         SET "coreWorkflowId" = cw.id
         FROM "${schema}"."workflow" w
         JOIN core."workflow" cw
           ON cw.id = w."coreWorkflowId" AND cw."workspaceId" = $1 AND cw."workspaceWorkflowId" = w.id
         WHERE cv."workspaceId" = $1 AND cv."coreWorkflowId" IS NULL AND cv."workflowId" = w.id
           AND w."deletedAt" IS NULL`,
        [workspaceId],
      );

      if (relinkedCoreVersionCount > 0) {
        this.logger.log(
          `${options.dryRun ? '[DRY RUN] Would relink' : 'Relinked'} ${relinkedCoreVersionCount} core workflow version(s) to their core workflow in workspace ${workspaceId}`,
        );
      }

      const [, deletedCoreVersionCount] = await queryRunner.query(
        `DELETE FROM core."workflowVersion" cv
         WHERE cv."workspaceId" = $1
           AND NOT EXISTS (
             SELECT 1 FROM core."workflow" cw WHERE cw.id = cv."coreWorkflowId"
           )
           AND NOT EXISTS (
             SELECT 1 FROM "${schema}"."workflowVersion" wv
             WHERE wv."coreWorkflowVersionId" = cv.id AND wv."deletedAt" IS NULL
           )`,
        [workspaceId],
      );

      if (deletedCoreVersionCount > 0) {
        this.logger.log(
          `${options.dryRun ? '[DRY RUN] Would delete' : 'Deleted'} ${deletedCoreVersionCount} core workflow version(s) without a core workflow in workspace ${workspaceId}`,
        );
      }

      const [, createdCoreVersionCount] = await queryRunner.query(
        `WITH "createdCoreVersions" AS (
           INSERT INTO core."workflowVersion"
             (id, "workspaceId", "universalIdentifier", "applicationId", triggers, steps, status, "workflowId", "coreWorkflowId", "workspaceWorkflowVersionId")
           SELECT gen_random_uuid(), $1, gen_random_uuid(), workspace."workspaceCustomApplicationId",
             CASE WHEN wv.trigger IS NULL THEN NULL ELSE jsonb_build_array(wv.trigger) END,
             wv.steps, wv.status::text::core."workflowVersion_status_enum", wv."workflowId", cw.id, wv.id
           FROM "${schema}"."workflowVersion" wv
           JOIN core."workspace" workspace ON workspace.id = $1
           JOIN "${schema}"."workflow" w ON w.id = wv."workflowId"
           JOIN core."workflow" cw
             ON cw.id = w."coreWorkflowId" AND cw."workspaceId" = $1 AND cw."workspaceWorkflowId" = wv."workflowId"
           WHERE wv."deletedAt" IS NULL AND wv."coreWorkflowVersionId" IS NULL
             AND NOT EXISTS (
               SELECT 1 FROM core."workflowVersion" existing
               WHERE existing."workspaceId" = $1 AND existing."workspaceWorkflowVersionId" = wv.id
             )
           RETURNING id, "workspaceWorkflowVersionId"
         )
         UPDATE "${schema}"."workflowVersion" wv
         SET "coreWorkflowVersionId" = "createdCoreVersions".id
         FROM "createdCoreVersions"
         WHERE wv.id = "createdCoreVersions"."workspaceWorkflowVersionId"`,
        [workspaceId],
      );

      if (createdCoreVersionCount > 0) {
        this.logger.log(
          `${options.dryRun ? '[DRY RUN] Would create' : 'Created'} ${createdCoreVersionCount} missing core workflow version(s) in workspace ${workspaceId}`,
        );
      }

      const invalidMappings: { id: string }[] = await queryRunner.query(
        `SELECT wv.id FROM "${schema}"."workflowVersion" wv
         LEFT JOIN core."workflowVersion" cv ON cv.id = wv."coreWorkflowVersionId"
         LEFT JOIN core."workflow" cw ON cw.id = cv."coreWorkflowId"
         WHERE (wv."deletedAt" IS NULL OR cv.id IS NOT NULL) AND (
           cv.id IS NULL OR cv."workspaceId" <> $1 OR
           cv."workflowId" IS DISTINCT FROM wv."workflowId" OR
           cw.id IS NULL OR cw."workspaceId" <> $1 OR
           cw."workspaceWorkflowId" IS DISTINCT FROM wv."workflowId" OR
           cv."workspaceWorkflowVersionId" IS DISTINCT FROM wv.id
         ) LIMIT 10`,
        [workspaceId],
      );
      const duplicates: { coreWorkflowVersionId: string }[] =
        await queryRunner.query(
          `SELECT wv."coreWorkflowVersionId" FROM "${schema}"."workflowVersion" wv
           JOIN core."workflowVersion" cv ON cv.id = wv."coreWorkflowVersionId" AND cv."workspaceId" = $1
           GROUP BY wv."coreWorkflowVersionId" HAVING count(*) > 1 LIMIT 10`,
          [workspaceId],
        );

      if (invalidMappings.length > 0 || duplicates.length > 0) {
        throw new Error(
          `Missing or conflicting workflow version mapping in workspace ${workspaceId}: ${[
            ...invalidMappings.map(({ id }) => `workspace version ${id}`),
            ...duplicates.map(
              ({ coreWorkflowVersionId }) =>
                `shared core version ${coreWorkflowVersionId}`,
            ),
          ].join(', ')}`,
        );
      }

      const conflictingRuns: { id: string }[] = await queryRunner.query(
        `SELECT r.id FROM "${schema}"."workflowRun" r
         LEFT JOIN core."workflowVersion" cv
           ON cv."workspaceId" = $1 AND cv."workspaceWorkflowVersionId" = r."workflowVersionId"
         LEFT JOIN core."workflow" cw
           ON cw."workspaceId" = $1 AND cw."workspaceWorkflowId" = r."workflowId"
         LEFT JOIN core."workflowVersion" "storedVersion"
           ON "storedVersion".id = r."coreWorkflowVersionId"
         LEFT JOIN core."workflow" "storedWorkflow"
           ON "storedWorkflow".id = r."coreWorkflowId"
         WHERE ("storedVersion".id IS NOT NULL AND cv.id IS NOT NULL AND "storedVersion".id <> cv.id)
            OR ("storedWorkflow".id IS NOT NULL AND cw.id IS NOT NULL AND "storedWorkflow".id <> cw.id)
            OR (cv.id IS NOT NULL AND cw.id IS NOT NULL AND cv."coreWorkflowId" <> cw.id)
         LIMIT 10`,
        [workspaceId],
      );

      if (conflictingRuns.length > 0) {
        throw new Error(
          `Conflicting workflow run core ids in workspace ${workspaceId}: ${conflictingRuns
            .map(({ id }) => id)
            .join(', ')}`,
        );
      }

      await queryRunner.query(
        `UPDATE "${schema}"."workflowRun" r
         SET "coreWorkflowVersionId" = cv.id
         FROM core."workflowVersion" cv
         WHERE cv."workspaceId" = $1 AND cv."workspaceWorkflowVersionId" = r."workflowVersionId"
           AND NOT EXISTS (
             SELECT 1 FROM core."workflowVersion" "storedVersion"
             WHERE "storedVersion".id = r."coreWorkflowVersionId"
           )`,
        [workspaceId],
      );
      await queryRunner.query(
        `UPDATE "${schema}"."workflowRun" r
         SET "coreWorkflowId" = cv."coreWorkflowId"
         FROM core."workflowVersion" cv
         WHERE cv."workspaceId" = $1 AND cv.id = r."coreWorkflowVersionId"
           AND NOT EXISTS (
             SELECT 1 FROM core."workflow" "storedWorkflow"
             WHERE "storedWorkflow".id = r."coreWorkflowId"
           )`,
        [workspaceId],
      );
      await queryRunner.query(
        `UPDATE "${schema}"."workflowRun" r
         SET "coreWorkflowId" = cw.id
         FROM core."workflow" cw
         WHERE cw."workspaceId" = $1 AND cw."workspaceWorkflowId" = r."workflowId"
           AND NOT EXISTS (
             SELECT 1 FROM core."workflow" "storedWorkflow"
             WHERE "storedWorkflow".id = r."coreWorkflowId"
           )`,
        [workspaceId],
      );

      const unmappedPendingRuns: { id: string }[] = await queryRunner.query(
        `SELECT r.id FROM "${schema}"."workflowRun" r
         LEFT JOIN core."workflowVersion" cv ON cv.id = r."coreWorkflowVersionId" AND cv."workspaceId" = $1
         LEFT JOIN core."workflow" cw ON cw.id = r."coreWorkflowId" AND cw."workspaceId" = $1
         WHERE r."deletedAt" IS NULL AND r.status IN ('NOT_STARTED', 'ENQUEUED', 'RUNNING')
           AND (cv.id IS NULL OR cw.id IS NULL OR cv."coreWorkflowId" <> cw.id)
           AND EXISTS (
             SELECT 1 FROM "${schema}"."workflowVersion" wv
             WHERE wv.id = r."workflowVersionId" AND wv."deletedAt" IS NULL
           )
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
           LEFT JOIN core."workflowVersion" cv ON cv."workspaceId" = cw."workspaceId"
             AND cv."workspaceWorkflowVersionId" = cw."lastPublishedVersionId"
           WHERE cw."workspaceId" = $1 AND cw."lastPublishedVersionId" IS NOT NULL
             AND EXISTS (
               SELECT 1 FROM "${schema}"."workflow" w
               WHERE (w."coreWorkflowId" = cw.id OR w.id = cw."workspaceWorkflowId") AND w."deletedAt" IS NULL
             )
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
        this.logger.log(`[DRY RUN] Workflow execution mappings validated in workspace ${workspaceId}`);
      } else {
        await queryRunner.commitTransaction();
        await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
          'flatWorkflowMaps',
          'flatWorkflowVersionMaps',
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
