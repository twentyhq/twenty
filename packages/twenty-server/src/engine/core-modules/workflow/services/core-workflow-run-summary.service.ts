import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type CoreWorkflowRunSummaryDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-run-summary.dto';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

const RECENT_RUNS_LIMIT = 10;

const RUN_COUNT_WINDOW_IN_DAYS = 14;

const WORKFLOW_RUN_ALIAS = 'workflowRun';

type CoreWorkflowRunSummaryRow = {
  coreWorkflowId: string;
  runCountLast14Days: string | number;
  recentRuns: CoreWorkflowRunSummaryDTO['recentRuns'] | null;
};

@Injectable()
export class CoreWorkflowRunSummaryService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  // Callers pass workflow ids the reader has already been authorized to see;
  // run-level permissions are enforced by the reader's own repository below.
  async findManyByCoreWorkflowIds(
    coreWorkflowIds: string[],
  ): Promise<CoreWorkflowRunSummaryDTO[]> {
    if (coreWorkflowIds.length === 0) {
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

    const rankedRunsQueryBuilder = workflowRunRepository
      .createQueryBuilder(WORKFLOW_RUN_ALIAS)
      .select([])
      .addSelect(column('coreWorkflowId'), 'coreWorkflowId')
      .addSelect(column('id'), 'id')
      .addSelect(column('status'), 'status')
      .addSelect(column('createdAt'), 'createdAt')
      .addSelect(
        `ROW_NUMBER() OVER (PARTITION BY ${column('coreWorkflowId')} ORDER BY ${column('createdAt')} DESC, ${column('id')} DESC)`,
        'recencyRank',
      )
      .where(`${column('coreWorkflowId')} IN (:...coreWorkflowIds)`, {
        coreWorkflowIds,
      });

    await rankedRunsQueryBuilder.applyRowLevelPermissions();

    const sql = `
      SELECT
        "coreWorkflowId",
        COUNT(*) FILTER (
          WHERE "createdAt" >= NOW() - MAKE_INTERVAL(days => :runCountWindowInDays)
        ) AS "runCountLast14Days",
        JSONB_AGG(
          JSONB_BUILD_OBJECT('id', "id", 'status', "status", 'createdAt', "createdAt")
          ORDER BY "recencyRank"
        ) FILTER (WHERE "recencyRank" <= :recentRunsLimit) AS "recentRuns"
      FROM (${rankedRunsQueryBuilder.getQuery()}) AS "rankedRuns"
      GROUP BY "coreWorkflowId"`;

    const rows =
      await workflowRunRepository.executeRaw<CoreWorkflowRunSummaryRow>(sql, {
        ...rankedRunsQueryBuilder.getParameters(),
        runCountWindowInDays: RUN_COUNT_WINDOW_IN_DAYS,
        recentRunsLimit: RECENT_RUNS_LIMIT,
      });

    const rowByCoreWorkflowId = new Map(
      rows.map((row) => [row.coreWorkflowId, row]),
    );

    return coreWorkflowIds.map((coreWorkflowId) => {
      const row = rowByCoreWorkflowId.get(coreWorkflowId);

      return {
        coreWorkflowId,
        runCountLast14Days: isDefined(row) ? Number(row.runCountLast14Days) : 0,
        recentRuns: row?.recentRuns ?? [],
      };
    });
  }
}
