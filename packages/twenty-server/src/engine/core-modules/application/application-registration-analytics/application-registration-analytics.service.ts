import { Injectable } from '@nestjs/common';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { APPLICATION_REGISTRATION_ANALYTICS_MIN_WORKSPACE_COUNT } from 'src/engine/core-modules/application/application-registration-analytics/constants/application-registration-analytics-min-workspace-count.constant';
import { type ApplicationRegistrationAnalyticsDTO } from 'src/engine/core-modules/application/application-registration-analytics/dtos/application-registration-analytics.dto';
import { type ApplicationRegistrationMetricCellRow } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-metric-cell-row.type';
import { buildApplicationRegistrationAnalyticsBreakdown } from 'src/engine/core-modules/application/application-registration-analytics/utils/build-application-registration-analytics-breakdown.util';
import { buildApplicationRegistrationAnalyticsTimeSeries } from 'src/engine/core-modules/application/application-registration-analytics/utils/build-application-registration-analytics-time-series.util';
import { buildApplicationRegistrationAnalyticsTotals } from 'src/engine/core-modules/application/application-registration-analytics/utils/build-application-registration-analytics-totals.util';
import { filterApplicationRegistrationMetricRowsByWorkspaceCount } from 'src/engine/core-modules/application/application-registration-analytics/utils/filter-application-registration-metric-rows-by-workspace-count.util';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';

type AnalyticsPeriodParams = {
  applicationRegistrationId: string;
  periodStart: Date;
  periodEnd: Date;
};

type AnalyticsPeriodQueryParams = {
  applicationRegistrationId: string;
  periodStart: string;
  periodEnd: string;
};

const PERIOD_WHERE_CLAUSE = `
  applicationRegistrationId = {applicationRegistrationId:String}
  AND timestamp >= {periodStart:DateTime64(3)}
  AND timestamp < {periodEnd:DateTime64(3)}
`;

const DAY_EXPRESSION = `formatDateTime(timestamp, '%Y-%m-%d')`;

// Rows without a workspace (version publishes) do not count toward the suppression threshold
const WORKSPACE_COUNT_EXPRESSION = `uniqExactIf(workspaceHash, workspaceHash != '')`;

// Every figure is a sum over (day, metric, dimension, context) cells that passed the workspace-count threshold, so differencing any two figures only ever exposes published cells
@Injectable()
export class ApplicationRegistrationAnalyticsService {
  constructor(private readonly clickHouseService: ClickHouseService) {}

  async getAnalytics(
    params: AnalyticsPeriodParams,
  ): Promise<ApplicationRegistrationAnalyticsDTO> {
    const [cells, activeWorkspaces] = await Promise.all([
      this.queryDailyCells(params),
      this.queryActiveWorkspaces(params),
    ]);

    const publishedCells =
      filterApplicationRegistrationMetricRowsByWorkspaceCount({ rows: cells });

    return {
      periodStart: params.periodStart,
      periodEnd: params.periodEnd,
      totals: buildApplicationRegistrationAnalyticsTotals({
        rows: publishedCells,
        activeWorkspaces,
      }),
      timeSeries: buildApplicationRegistrationAnalyticsTimeSeries({
        rows: publishedCells,
        periodStart: params.periodStart,
        periodEnd: params.periodEnd,
      }),
      functionErrorsByType: buildApplicationRegistrationAnalyticsBreakdown({
        rows: publishedCells,
        metrics: ['function.error'],
        groupBy: 'dimension',
      }),
      functionErrorsByFunction: buildApplicationRegistrationAnalyticsBreakdown({
        rows: publishedCells,
        metrics: ['function.error'],
        groupBy: 'context',
      }),
      functionExecutionsByFunction:
        buildApplicationRegistrationAnalyticsBreakdown({
          rows: publishedCells,
          metrics: ['function.execution'],
          groupBy: 'dimension',
        }),
      lifecycleFailuresByErrorCode:
        buildApplicationRegistrationAnalyticsBreakdown({
          rows: publishedCells,
          metrics: ['install.failed', 'upgrade.failed', 'uninstall.failed'],
          groupBy: 'dimension',
        }),
      creditsChargedByOperation: buildApplicationRegistrationAnalyticsBreakdown(
        {
          rows: publishedCells,
          metrics: ['charge.credits_micro'],
          groupBy: 'dimension',
          convertValue: toDisplayCredits,
        },
      ),
    };
  }

  private buildPeriodParams({
    applicationRegistrationId,
    periodStart,
    periodEnd,
  }: AnalyticsPeriodParams): AnalyticsPeriodQueryParams {
    return {
      applicationRegistrationId,
      periodStart: formatDateTimeForClickHouse(periodStart),
      periodEnd: formatDateTimeForClickHouse(periodEnd),
    };
  }

  private async queryDailyCells(
    params: AnalyticsPeriodParams,
  ): Promise<ApplicationRegistrationMetricCellRow[]> {
    return this.clickHouseService.selectOrThrow<ApplicationRegistrationMetricCellRow>(
      `SELECT ${DAY_EXPRESSION} AS date,
              metric,
              dimension,
              context,
              sum(value) AS value,
              ${WORKSPACE_COUNT_EXPRESSION} AS workspaceCount
       FROM applicationRegistrationMetric
       WHERE ${PERIOD_WHERE_CLAUSE}
       GROUP BY date, metric, dimension, context
       ORDER BY date ASC`,
      this.buildPeriodParams(params),
    );
  }

  // Only workspaces behind a published cell are counted, so widening the period by a day cannot reveal activity on a withheld cell
  private async queryActiveWorkspaces(
    params: AnalyticsPeriodParams,
  ): Promise<number> {
    const rows = await this.clickHouseService.selectOrThrow<{
      activeWorkspaces: string | number;
    }>(
      `SELECT uniqExact(workspaceHash) AS activeWorkspaces
       FROM applicationRegistrationMetric
       WHERE ${PERIOD_WHERE_CLAUSE}
         AND workspaceHash != ''
         AND (${DAY_EXPRESSION}, metric, dimension, context) IN (
           SELECT ${DAY_EXPRESSION} AS date, metric, dimension, context
           FROM applicationRegistrationMetric
           WHERE ${PERIOD_WHERE_CLAUSE}
           GROUP BY date, metric, dimension, context
           HAVING ${WORKSPACE_COUNT_EXPRESSION} >= {minimumWorkspaceCount:UInt32}
         )`,
      {
        ...this.buildPeriodParams(params),
        minimumWorkspaceCount:
          APPLICATION_REGISTRATION_ANALYTICS_MIN_WORKSPACE_COUNT,
      },
    );

    return Number(rows[0]?.activeWorkspaces ?? 0);
  }
}
