import { Injectable } from '@nestjs/common';

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type CoreWorkflowRunSummaryDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-run-summary.dto';
import { buildCoreWorkflowRunCountWindowPredicate } from 'src/engine/core-modules/workflow/utils/build-core-workflow-run-count-window-predicate.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { NUMBER_OF_WORKFLOW_RUNS_TO_KEEP } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/number-of-workflow-runs-to-keep';

const RECENT_RUNS_LIMIT = 10;

const WORKFLOW_RUN_ALIAS = 'workflowRun';

const REQUESTED_WORKFLOW_ALIAS = 'requestedWorkflow';

type CoreWorkflowRunSummaryRow = {
  coreWorkflowId: string;
  runCount: string | number;
  recentRuns: CoreWorkflowRunSummaryDTO['recentRuns'];
};

@Injectable()
export class CoreWorkflowRunSummaryService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  // Callers pass ids the reader may see; run permissions apply through the reader's repository
  async findManyByCoreWorkflowIds(
    coreWorkflowIds: string[],
  ): Promise<CoreWorkflowRunSummaryDTO[]> {
    if (!isNonEmptyArray(coreWorkflowIds)) {
      return [];
    }

    try {
      return await this.workspaceOrmManager.executeInWorkspaceContext(() =>
        this.querySummaries(coreWorkflowIds),
      );
    } catch (error) {
      if (
        error instanceof PermissionsException &&
        error.code === PermissionsExceptionCode.PERMISSION_DENIED
      ) {
        return [];
      }

      throw error;
    }
  }

  private async querySummaries(
    coreWorkflowIds: string[],
  ): Promise<CoreWorkflowRunSummaryDTO[]> {
    const workflowRunRepository =
      this.workspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
        'workflowRun',
      );

    const column = (columnName: keyof WorkflowRunWorkspaceEntity) =>
      `"${WORKFLOW_RUN_ALIAS}"."${columnName}"`;

    // Correlated on each requested workflow so every lateral walks the (coreWorkflowId, createdAt) index
    const buildRequestedWorkflowRunsQueryBuilder = () =>
      workflowRunRepository
        .createQueryBuilder(WORKFLOW_RUN_ALIAS)
        .select([])
        .where(
          `${column('coreWorkflowId')} = "${REQUESTED_WORKFLOW_ALIAS}"."id"`,
        );

    const recentRunsQueryBuilder = buildRequestedWorkflowRunsQueryBuilder()
      .addSelect(column('id'), 'id')
      .addSelect(column('status'), 'status')
      .addSelect(column('createdAt'), 'createdAt');

    const runCountWindow = buildCoreWorkflowRunCountWindowPredicate(
      column('createdAt'),
    );

    const runCountQueryBuilder = buildRequestedWorkflowRunsQueryBuilder()
      .addSelect('COUNT(*)', 'runCount')
      .andWhere(runCountWindow.predicate, runCountWindow.parameters);

    await recentRunsQueryBuilder.applyRowLevelPermissions();
    await runCountQueryBuilder.applyRowLevelPermissions();

    const sql = `
      SELECT
        "${REQUESTED_WORKFLOW_ALIAS}"."id" AS "coreWorkflowId",
        "runCount"."runCount" AS "runCount",
        "recentRuns"."recentRuns" AS "recentRuns"
      FROM UNNEST(ARRAY[:...coreWorkflowIds]::uuid[]) AS "${REQUESTED_WORKFLOW_ALIAS}"("id")
      CROSS JOIN LATERAL (${runCountQueryBuilder.getQuery()}) AS "runCount"
      CROSS JOIN LATERAL (
        SELECT COALESCE(
          JSONB_AGG(
            JSONB_BUILD_OBJECT(
              'id', "recentRun"."id",
              'status', "recentRun"."status",
              'createdAt', "recentRun"."createdAt"
            )
            ORDER BY "recentRun"."createdAt" DESC, "recentRun"."id" DESC
          ),
          '[]'::jsonb
        ) AS "recentRuns"
        FROM (
          SELECT *
          FROM (${recentRunsQueryBuilder.getQuery()}) AS "candidateRun"
          -- row-level rules can hide these columns, which would break the non-nullable DTO and sort first
          WHERE "candidateRun"."id" IS NOT NULL
            AND "candidateRun"."status" IS NOT NULL
            AND "candidateRun"."createdAt" IS NOT NULL
          ORDER BY "candidateRun"."createdAt" DESC, "candidateRun"."id" DESC
          LIMIT :recentRunsLimit
        ) AS "recentRun"
      ) AS "recentRuns"`;

    const rows =
      await workflowRunRepository.executeRaw<CoreWorkflowRunSummaryRow>(sql, {
        ...recentRunsQueryBuilder.getParameters(),
        ...runCountQueryBuilder.getParameters(),
        coreWorkflowIds,
        recentRunsLimit: RECENT_RUNS_LIMIT,
      });

    const rowByCoreWorkflowId = new Map(
      rows.map((row) => [row.coreWorkflowId, row]),
    );

    return coreWorkflowIds.map((coreWorkflowId) => {
      const row = rowByCoreWorkflowId.get(coreWorkflowId);
      const runCount = Number(row?.runCount ?? 0);

      return {
        coreWorkflowId,
        runCountLast14Days: runCount,
        isRunCountLowerBound: runCount >= NUMBER_OF_WORKFLOW_RUNS_TO_KEEP,
        recentRuns: row?.recentRuns ?? [],
      };
    });
  }
}
