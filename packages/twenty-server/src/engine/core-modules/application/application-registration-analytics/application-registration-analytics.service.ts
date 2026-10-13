import { Injectable } from '@nestjs/common';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import {
  type ApplicationRegistrationAnalyticsBreakdownItemDTO,
  type ApplicationRegistrationAnalyticsDTO,
} from 'src/engine/core-modules/application/application-registration-analytics/dtos/application-registration-analytics.dto';
import { type ApplicationRegistrationMetricName } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-metric-name.type';
import {
  type ApplicationRegistrationMetricDailyBreakdownRow,
  buildApplicationRegistrationAnalyticsBreakdown,
} from 'src/engine/core-modules/application/application-registration-analytics/utils/build-application-registration-analytics-breakdown.util';
import {
  type ApplicationRegistrationMetricDailySumRow,
  buildApplicationRegistrationAnalyticsTimeSeries,
} from 'src/engine/core-modules/application/application-registration-analytics/utils/build-application-registration-analytics-time-series.util';
import { buildApplicationRegistrationAnalyticsTotals } from 'src/engine/core-modules/application/application-registration-analytics/utils/build-application-registration-analytics-totals.util';
import {
  type ApplicationRegistrationMetricRowWithWorkspaceCount,
  filterApplicationRegistrationMetricRowsByWorkspaceCount,
} from 'src/engine/core-modules/application/application-registration-analytics/utils/filter-application-registration-metric-rows-by-workspace-count.util';
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

type DailyMetricRow = ApplicationRegistrationMetricDailySumRow &
  ApplicationRegistrationMetricRowWithWorkspaceCount;

type BreakdownGroupByField = 'dimension' | 'context';

const PERIOD_WHERE_CLAUSE = `
  applicationRegistrationId = {applicationRegistrationId:String}
  AND timestamp >= {periodStart:DateTime64(3)}
  AND timestamp < {periodEnd:DateTime64(3)}
`;

const DAY_EXPRESSION = `formatDateTime(timestamp, '%Y-%m-%d')`;

// Rows without a workspace (version publishes) do not count toward the suppression threshold
const WORKSPACE_COUNT_EXPRESSION = `uniqExactIf(workspaceHash, workspaceHash != '')`;

// Every figure comes from daily cells that passed the workspace-count threshold, so nothing can be differenced into one workspace's activity
@Injectable()
export class ApplicationRegistrationAnalyticsService {
  constructor(private readonly clickHouseService: ClickHouseService) {}

  async getAnalytics(
    params: AnalyticsPeriodParams,
  ): Promise<ApplicationRegistrationAnalyticsDTO> {
    const [
      dailyRows,
      activeWorkspaces,
      functionErrorsByType,
      functionErrorsByFunction,
      functionExecutionsByFunction,
      lifecycleFailuresByErrorCode,
      creditsChargedByOperation,
    ] = await Promise.all([
      this.queryDailySums(params),
      this.queryActiveWorkspaces(params),
      this.queryBreakdown({
        ...params,
        metrics: ['function.error'],
        groupBy: 'dimension',
      }),
      this.queryBreakdown({
        ...params,
        metrics: ['function.error'],
        groupBy: 'context',
      }),
      this.queryBreakdown({
        ...params,
        metrics: ['function.execution'],
        groupBy: 'dimension',
      }),
      this.queryBreakdown({
        ...params,
        metrics: ['install.failed', 'upgrade.failed', 'uninstall.failed'],
        groupBy: 'dimension',
      }),
      this.queryBreakdown({
        ...params,
        metrics: ['charge.credits_micro'],
        groupBy: 'dimension',
        convertValue: toDisplayCredits,
      }),
    ]);

    const publishedDailyRows =
      filterApplicationRegistrationMetricRowsByWorkspaceCount(dailyRows);

    return {
      periodStart: params.periodStart,
      periodEnd: params.periodEnd,
      totals: buildApplicationRegistrationAnalyticsTotals({
        rows: publishedDailyRows,
        activeWorkspaces,
      }),
      timeSeries: buildApplicationRegistrationAnalyticsTimeSeries({
        rows: publishedDailyRows,
        periodStart: params.periodStart,
        periodEnd: params.periodEnd,
      }),
      functionErrorsByType,
      functionErrorsByFunction,
      functionExecutionsByFunction,
      lifecycleFailuresByErrorCode,
      creditsChargedByOperation,
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

  private async queryDailySums(
    params: AnalyticsPeriodParams,
  ): Promise<DailyMetricRow[]> {
    return this.clickHouseService.selectOrThrow<DailyMetricRow>(
      `SELECT ${DAY_EXPRESSION} AS date,
              metric,
              sum(value) AS value,
              ${WORKSPACE_COUNT_EXPRESSION} AS workspaceCount
       FROM applicationRegistrationMetric
       WHERE ${PERIOD_WHERE_CLAUSE}
       GROUP BY date, metric
       ORDER BY date ASC`,
      this.buildPeriodParams(params),
    );
  }

  private async queryActiveWorkspaces(
    params: AnalyticsPeriodParams,
  ): Promise<number> {
    const rows = await this.clickHouseService.selectOrThrow<{
      activeWorkspaces: string | number;
    }>(
      `SELECT ${WORKSPACE_COUNT_EXPRESSION} AS activeWorkspaces
       FROM applicationRegistrationMetric
       WHERE ${PERIOD_WHERE_CLAUSE}`,
      this.buildPeriodParams(params),
    );

    return Number(rows[0]?.activeWorkspaces ?? 0);
  }

  private async queryBreakdown({
    metrics,
    groupBy,
    convertValue,
    ...params
  }: AnalyticsPeriodParams & {
    metrics: ApplicationRegistrationMetricName[];
    groupBy: BreakdownGroupByField;
    convertValue?: (value: number) => number;
  }): Promise<ApplicationRegistrationAnalyticsBreakdownItemDTO[]> {
    const rows =
      await this.clickHouseService.selectOrThrow<ApplicationRegistrationMetricDailyBreakdownRow>(
        `SELECT ${groupBy} AS key,
                ${DAY_EXPRESSION} AS date,
                sum(value) AS value,
                ${WORKSPACE_COUNT_EXPRESSION} AS workspaceCount
         FROM applicationRegistrationMetric
         WHERE ${PERIOD_WHERE_CLAUSE}
           AND metric IN ({metrics:Array(String)})
           AND ${groupBy} != ''
         GROUP BY key, date`,
        { ...this.buildPeriodParams(params), metrics },
      );

    return buildApplicationRegistrationAnalyticsBreakdown({
      rows,
      convertValue,
    });
  }
}
