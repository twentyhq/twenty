import { Injectable } from '@nestjs/common';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { APPLICATION_REGISTRATION_ANALYTICS_BREAKDOWN_LIMIT } from 'src/engine/core-modules/application/application-registration-analytics/constants/application-registration-analytics-breakdown-limit.constant';
import {
  type ApplicationRegistrationAnalyticsBreakdownItemDTO,
  type ApplicationRegistrationAnalyticsDTO,
} from 'src/engine/core-modules/application/application-registration-analytics/dtos/application-registration-analytics.dto';
import { type ApplicationRegistrationMetricName } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-metric-name.type';
import { type ApplicationRegistrationMetricSumRow } from 'src/engine/core-modules/application/application-registration-analytics/utils/add-metric-row-to-application-registration-analytics-counts.util';
import {
  type ApplicationRegistrationMetricDailySumRow,
  buildApplicationRegistrationAnalyticsTimeSeries,
} from 'src/engine/core-modules/application/application-registration-analytics/utils/build-application-registration-analytics-time-series.util';
import { buildApplicationRegistrationAnalyticsTotals } from 'src/engine/core-modules/application/application-registration-analytics/utils/build-application-registration-analytics-totals.util';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';

type AnalyticsPeriodParams = {
  applicationRegistrationId: string;
  periodStart: Date;
  periodEnd: Date;
};

type BreakdownRow = {
  key: string;
  value: string | number;
};

type BreakdownGroupByField = 'dimension' | 'context';

const PERIOD_WHERE_CLAUSE = `
  applicationRegistrationId = {applicationRegistrationId:String}
  AND timestamp >= {periodStart:DateTime64(3)}
  AND timestamp < {periodEnd:DateTime64(3)}
`;

@Injectable()
export class ApplicationRegistrationAnalyticsService {
  constructor(private readonly clickHouseService: ClickHouseService) {}

  async getAnalytics(
    params: AnalyticsPeriodParams,
  ): Promise<ApplicationRegistrationAnalyticsDTO> {
    const [
      totalRows,
      activeWorkspaces,
      dailyRows,
      functionErrorsByType,
      functionErrorsByFunction,
      functionExecutionsByFunction,
      lifecycleFailuresByErrorCode,
      creditsChargedByOperationMicro,
    ] = await Promise.all([
      this.queryTotals(params),
      this.queryActiveWorkspaces(params),
      this.queryDailySums(params),
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
      }),
    ]);

    return {
      periodStart: params.periodStart,
      periodEnd: params.periodEnd,
      totals: buildApplicationRegistrationAnalyticsTotals({
        rows: totalRows,
        activeWorkspaces,
      }),
      timeSeries: buildApplicationRegistrationAnalyticsTimeSeries({
        rows: dailyRows,
        periodStart: params.periodStart,
        periodEnd: params.periodEnd,
      }),
      functionErrorsByType,
      functionErrorsByFunction,
      functionExecutionsByFunction,
      lifecycleFailuresByErrorCode,
      creditsChargedByOperation: creditsChargedByOperationMicro.map((item) => ({
        key: item.key,
        value: toDisplayCredits(item.value),
      })),
    };
  }

  private buildPeriodParams({
    applicationRegistrationId,
    periodStart,
    periodEnd,
  }: AnalyticsPeriodParams): Record<string, unknown> {
    return {
      applicationRegistrationId,
      periodStart: formatDateTimeForClickHouse(periodStart),
      periodEnd: formatDateTimeForClickHouse(periodEnd),
    };
  }

  private async queryTotals(
    params: AnalyticsPeriodParams,
  ): Promise<ApplicationRegistrationMetricSumRow[]> {
    return this.clickHouseService.selectOrThrow<ApplicationRegistrationMetricSumRow>(
      `SELECT metric, sum(value) AS value
       FROM applicationRegistrationMetric
       WHERE ${PERIOD_WHERE_CLAUSE}
       GROUP BY metric`,
      this.buildPeriodParams(params),
    );
  }

  private async queryActiveWorkspaces(
    params: AnalyticsPeriodParams,
  ): Promise<number> {
    const rows = await this.clickHouseService.selectOrThrow<{
      activeWorkspaces: string | number;
    }>(
      `SELECT uniqExact(workspaceHash) AS activeWorkspaces
       FROM applicationRegistrationMetric
       WHERE ${PERIOD_WHERE_CLAUSE}
         AND workspaceHash != ''`,
      this.buildPeriodParams(params),
    );

    return Number(rows[0]?.activeWorkspaces ?? 0);
  }

  private async queryDailySums(
    params: AnalyticsPeriodParams,
  ): Promise<ApplicationRegistrationMetricDailySumRow[]> {
    return this.clickHouseService.selectOrThrow<ApplicationRegistrationMetricDailySumRow>(
      `SELECT formatDateTime(timestamp, '%Y-%m-%d') AS date,
              metric,
              sum(value) AS value
       FROM applicationRegistrationMetric
       WHERE ${PERIOD_WHERE_CLAUSE}
       GROUP BY date, metric
       ORDER BY date ASC`,
      this.buildPeriodParams(params),
    );
  }

  private async queryBreakdown({
    metrics,
    groupBy,
    ...params
  }: AnalyticsPeriodParams & {
    metrics: ApplicationRegistrationMetricName[];
    groupBy: BreakdownGroupByField;
  }): Promise<ApplicationRegistrationAnalyticsBreakdownItemDTO[]> {
    const rows = await this.clickHouseService.selectOrThrow<BreakdownRow>(
      `SELECT ${groupBy} AS key, sum(value) AS value
       FROM applicationRegistrationMetric
       WHERE ${PERIOD_WHERE_CLAUSE}
         AND metric IN ({metrics:Array(String)})
         AND ${groupBy} != ''
       GROUP BY key
       ORDER BY value DESC
       LIMIT ${APPLICATION_REGISTRATION_ANALYTICS_BREAKDOWN_LIMIT}`,
      { ...this.buildPeriodParams(params), metrics },
    );

    return rows.map((row) => ({ key: row.key, value: Number(row.value) }));
  }
}
