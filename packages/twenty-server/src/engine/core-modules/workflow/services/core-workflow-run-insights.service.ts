import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { CORE_WORKFLOW_RUN_COUNT_WINDOW_IN_DAYS } from 'src/engine/core-modules/workflow/constants/core-workflow-run-count-window-in-days.constant';
import { type CoreWorkflowRunInsightsDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-run-insights.dto';
import { buildCoreWorkflowRunCountWindowPredicate } from 'src/engine/core-modules/workflow/utils/build-core-workflow-run-count-window-predicate.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import {
  type WorkflowRunWorkspaceEntity,
  WorkflowRunStatus,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { NUMBER_OF_WORKFLOW_RUNS_TO_KEEP } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/number-of-workflow-runs-to-keep';

const RECENT_FAILED_RUNS_LIMIT = 5;

const WORKFLOW_RUN_ALIAS = 'workflowRun';

type TotalsRow = {
  runCount: string | number;
  failedRunCount: string | number;
  averageDurationInMs: string | number | null;
};

type DailyRunCountRow = {
  day: string;
  completedRunCount: string | number;
  failedRunCount: string | number;
  otherRunCount: string | number;
};

type FailedRunRow = {
  id: string;
  name: string | null;
  createdAt: Date | string;
  errorMessage: string | null;
};

const toIsoString = (value: Date | string) =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

@Injectable()
export class CoreWorkflowRunInsightsService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  // Callers pass a workflow the reader may see; run permissions apply through the reader's repository
  async findOneByCoreWorkflowId({
    coreWorkflowId,
    timeZone,
  }: {
    coreWorkflowId: string;
    timeZone: string;
  }): Promise<CoreWorkflowRunInsightsDTO | null> {
    try {
      return await this.workspaceOrmManager.executeInWorkspaceContext(() =>
        this.queryInsights({ coreWorkflowId, timeZone }),
      );
    } catch (error) {
      if (
        error instanceof PermissionsException &&
        error.code === PermissionsExceptionCode.PERMISSION_DENIED
      ) {
        return null;
      }

      throw error;
    }
  }

  private async queryInsights({
    coreWorkflowId,
    timeZone,
  }: {
    coreWorkflowId: string;
    timeZone: string;
  }): Promise<CoreWorkflowRunInsightsDTO> {
    const workflowRunRepository =
      this.workspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
        'workflowRun',
      );

    const column = (columnName: keyof WorkflowRunWorkspaceEntity) =>
      `"${WORKFLOW_RUN_ALIAS}"."${columnName}"`;

    const buildWorkflowRunsQueryBuilder = () =>
      workflowRunRepository
        .createQueryBuilder(WORKFLOW_RUN_ALIAS)
        .select([])
        .where(`${column('coreWorkflowId')} = :coreWorkflowId`, {
          coreWorkflowId,
        });

    // Totals share the index column's rolling window; the bars need local calendar days
    const runCountWindow = buildCoreWorkflowRunCountWindowPredicate(
      column('createdAt'),
    );
    const windowFirstLocalDay = `DATE_TRUNC('day', NOW() AT TIME ZONE :timeZone) - MAKE_INTERVAL(days => :lastDayOffset)`;

    const totalsQueryBuilder = buildWorkflowRunsQueryBuilder()
      .addSelect('COUNT(*)', 'runCount')
      .addSelect(
        `COUNT(*) FILTER (WHERE ${column('status')} = :failedStatus)`,
        'failedRunCount',
      )
      .addSelect(
        `AVG(EXTRACT(EPOCH FROM (${column('endedAt')} - ${column('startedAt')})) * 1000) FILTER (WHERE ${column('status')} = :completedStatus)`,
        'averageDurationInMs',
      )
      .andWhere(runCountWindow.predicate, runCountWindow.parameters);

    const dailyRunsQueryBuilder = buildWorkflowRunsQueryBuilder()
      .addSelect(column('id'), 'id')
      .addSelect(column('status'), 'status')
      .addSelect(column('createdAt'), 'createdAt')
      .andWhere(
        `${column('createdAt')} >= (${windowFirstLocalDay}) AT TIME ZONE :timeZone`,
      );

    const failedRunsQueryBuilder = buildWorkflowRunsQueryBuilder()
      .addSelect(column('id'), 'id')
      .addSelect(column('name'), 'name')
      .addSelect(column('createdAt'), 'createdAt')
      // A plain column gets the row-level nullification an expression on it would skip
      .addSelect(column('state'), 'state')
      .andWhere(`${column('status')} = :failedStatus`);

    await totalsQueryBuilder.applyRowLevelPermissions();
    await dailyRunsQueryBuilder.applyRowLevelPermissions();
    await failedRunsQueryBuilder.applyRowLevelPermissions();

    const parameters = {
      completedStatus: WorkflowRunStatus.COMPLETED,
      failedStatus: WorkflowRunStatus.FAILED,
      lastDayOffset: CORE_WORKFLOW_RUN_COUNT_WINDOW_IN_DAYS - 1,
      timeZone,
      recentFailedRunsLimit: RECENT_FAILED_RUNS_LIMIT,
    };

    const [[totals], dailyRunCounts, recentFailedRuns] = await Promise.all([
      workflowRunRepository.executeRaw<TotalsRow>(
        totalsQueryBuilder.getQuery(),
        { ...totalsQueryBuilder.getParameters(), ...parameters },
      ),
      workflowRunRepository.executeRaw<DailyRunCountRow>(
        `
        SELECT
          TO_CHAR("calendarDay"."day", 'YYYY-MM-DD') AS "day",
          COUNT("dailyRun"."id") FILTER (WHERE "dailyRun"."status" = :completedStatus) AS "completedRunCount",
          COUNT("dailyRun"."id") FILTER (WHERE "dailyRun"."status" = :failedStatus) AS "failedRunCount",
          COUNT("dailyRun"."id") FILTER (WHERE "dailyRun"."status" NOT IN (:completedStatus, :failedStatus)) AS "otherRunCount"
        FROM GENERATE_SERIES(
          ${windowFirstLocalDay},
          DATE_TRUNC('day', NOW() AT TIME ZONE :timeZone),
          INTERVAL '1 day'
        ) AS "calendarDay"("day")
        LEFT JOIN (${dailyRunsQueryBuilder.getQuery()}) AS "dailyRun"
          ON DATE_TRUNC('day', "dailyRun"."createdAt" AT TIME ZONE :timeZone) = "calendarDay"."day"
        GROUP BY "calendarDay"."day"
        ORDER BY "calendarDay"."day"`,
        { ...dailyRunsQueryBuilder.getParameters(), ...parameters },
      ),
      workflowRunRepository.executeRaw<FailedRunRow>(
        `
        SELECT
          "failedRun"."id",
          "failedRun"."name",
          "failedRun"."createdAt",
          "failedRun"."state"->>'workflowRunError' AS "errorMessage"
        FROM (${failedRunsQueryBuilder.getQuery()}) AS "failedRun"
        ORDER BY "failedRun"."createdAt" DESC, "failedRun"."id" DESC
        LIMIT :recentFailedRunsLimit`,
        { ...failedRunsQueryBuilder.getParameters(), ...parameters },
      ),
    ]);

    const runCount = Number(totals?.runCount ?? 0);

    return {
      coreWorkflowId,
      runCount,
      failedRunCount: Number(totals?.failedRunCount ?? 0),
      isRunCountLowerBound: runCount >= NUMBER_OF_WORKFLOW_RUNS_TO_KEEP,
      averageDurationInMs: isDefined(totals?.averageDurationInMs)
        ? Number(totals.averageDurationInMs)
        : null,
      dailyRunCounts: dailyRunCounts.map((dailyRunCount) => ({
        day: dailyRunCount.day,
        completedRunCount: Number(dailyRunCount.completedRunCount),
        failedRunCount: Number(dailyRunCount.failedRunCount),
        otherRunCount: Number(dailyRunCount.otherRunCount),
      })),
      recentFailedRuns: recentFailedRuns.map((failedRun) => ({
        id: failedRun.id,
        name: failedRun.name,
        createdAt: toIsoString(failedRun.createdAt),
        errorMessage: failedRun.errorMessage,
      })),
    };
  }
}
