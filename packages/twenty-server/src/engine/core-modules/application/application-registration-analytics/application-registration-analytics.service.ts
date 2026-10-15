import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { type ApplicationRegistrationAnalyticsDTO } from 'src/engine/core-modules/application/application-registration-analytics/dtos/application-registration-analytics.dto';
import { type ApplicationRegistrationDailyVersionActiveWorkspacesRow } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-daily-version-active-workspaces-row.type';
import { type ApplicationRegistrationMetricCellRow } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-metric-cell-row.type';
import { type ApplicationRegistrationVersionActiveWorkspacesRow } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-version-active-workspaces-row.type';
import { buildApplicationRegistrationAnalyticsBreakdown } from 'src/engine/core-modules/application/application-registration-analytics/utils/build-application-registration-analytics-breakdown.util';
import { buildApplicationRegistrationAnalyticsTimeSeries } from 'src/engine/core-modules/application/application-registration-analytics/utils/build-application-registration-analytics-time-series.util';
import { buildApplicationRegistrationAnalyticsTotals } from 'src/engine/core-modules/application/application-registration-analytics/utils/build-application-registration-analytics-totals.util';
import { buildApplicationRegistrationAnalyticsVersions } from 'src/engine/core-modules/application/application-registration-analytics/utils/build-application-registration-analytics-versions.util';
import { hashWorkspaceIdForApplicationRegistrationMetric } from 'src/engine/core-modules/application/application-registration-analytics/utils/hash-workspace-id-for-application-registration-metric.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';

type AnalyticsPeriodParams = {
  applicationRegistrationId: string;
  periodStart: Date;
  periodEnd: Date;
  workspaceId?: string;
};

type AnalyticsPeriodQueryParams = {
  applicationRegistrationId: string;
  periodStart: string;
  periodEnd: string;
  workspaceHash: string;
};

// An empty workspace hash reports across every workspace the app is installed in
const PERIOD_WHERE_CLAUSE = `
  applicationRegistrationId = {applicationRegistrationId:String}
  AND timestamp >= {periodStart:DateTime64(3)}
  AND timestamp < {periodEnd:DateTime64(3)}
  AND ({workspaceHash:String} = '' OR workspaceHash = {workspaceHash:String})
`;

// Version publishes carry no workspace, and failed installs and upgrades record a target version the workspace never ran
const ACTIVE_WORKSPACE_WHERE_CLAUSE = `
  ${PERIOD_WHERE_CLAUSE}
  AND workspaceHash != ''
  AND metric NOT IN ('install.failed', 'upgrade.failed')
`;

const DAY_EXPRESSION = `formatDateTime(timestamp, '%Y-%m-%d')`;

// Every count is derived from the same daily cells, so totals, time series, breakdowns and versions can never disagree with each other
@Injectable()
export class ApplicationRegistrationAnalyticsService {
  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly applicationLookupService: ApplicationLookupService,
  ) {}

  async getAnalyticsForApplicationOrThrow({
    applicationId,
    workspaceId,
    periodStart,
    periodEnd,
  }: {
    applicationId: string;
    workspaceId: string;
    periodStart: Date;
    periodEnd: Date;
  }): Promise<ApplicationRegistrationAnalyticsDTO> {
    const application = await this.applicationLookupService.findById({
      id: applicationId,
      workspaceId,
    });

    if (!isDefined(application?.applicationRegistrationId)) {
      throw new ApplicationException(
        `Application ${applicationId} not found or not linked to a registration in this workspace`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    // The installing workspace only ever sees its own activity, never the app's other installs
    return this.getAnalytics({
      applicationRegistrationId: application.applicationRegistrationId,
      workspaceId,
      periodStart,
      periodEnd,
    });
  }

  async getAnalytics(
    params: AnalyticsPeriodParams,
  ): Promise<ApplicationRegistrationAnalyticsDTO> {
    const [
      cells,
      activeWorkspaces,
      activeWorkspacesByVersion,
      dailyActiveWorkspacesByVersion,
    ] = await Promise.all([
      this.queryDailyCells(params),
      this.queryActiveWorkspaces(params),
      this.queryActiveWorkspacesByVersion(params),
      this.queryDailyActiveWorkspacesByVersion(params),
    ]);

    return {
      periodStart: params.periodStart,
      periodEnd: params.periodEnd,
      totals: buildApplicationRegistrationAnalyticsTotals({
        rows: cells,
        activeWorkspaces,
      }),
      timeSeries: buildApplicationRegistrationAnalyticsTimeSeries({
        rows: cells,
        periodStart: params.periodStart,
        periodEnd: params.periodEnd,
      }),
      functionErrorsByType: buildApplicationRegistrationAnalyticsBreakdown({
        rows: cells,
        metrics: ['function.error'],
        groupBy: 'dimension',
      }),
      functionErrorsByFunction: buildApplicationRegistrationAnalyticsBreakdown({
        rows: cells,
        metrics: ['function.error'],
        groupBy: 'context',
      }),
      functionExecutionsByFunction:
        buildApplicationRegistrationAnalyticsBreakdown({
          rows: cells,
          metrics: ['function.execution'],
          groupBy: 'dimension',
        }),
      lifecycleFailuresByErrorCode:
        buildApplicationRegistrationAnalyticsBreakdown({
          rows: cells,
          metrics: ['install.failed', 'upgrade.failed', 'uninstall.failed'],
          groupBy: 'dimension',
        }),
      creditsChargedByOperation: buildApplicationRegistrationAnalyticsBreakdown(
        {
          rows: cells,
          metrics: ['charge.credits_micro'],
          groupBy: 'dimension',
          convertValue: toDisplayCredits,
        },
      ),
      versions: buildApplicationRegistrationAnalyticsVersions({
        cells,
        activeWorkspacesByVersion,
        dailyActiveWorkspacesByVersion,
        periodStart: params.periodStart,
        periodEnd: params.periodEnd,
      }),
    };
  }

  private buildPeriodParams({
    applicationRegistrationId,
    periodStart,
    periodEnd,
    workspaceId,
  }: AnalyticsPeriodParams): AnalyticsPeriodQueryParams {
    return {
      applicationRegistrationId,
      periodStart: formatDateTimeForClickHouse(periodStart),
      periodEnd: formatDateTimeForClickHouse(periodEnd),
      workspaceHash: isDefined(workspaceId)
        ? hashWorkspaceIdForApplicationRegistrationMetric({
            workspaceId,
            secret: this.twentyConfigService.get('APP_SECRET'),
          })
        : '',
    };
  }

  private async queryDailyCells(
    params: AnalyticsPeriodParams,
  ): Promise<ApplicationRegistrationMetricCellRow[]> {
    return this.clickHouseService.selectOrThrow<ApplicationRegistrationMetricCellRow>(
      `SELECT ${DAY_EXPRESSION} AS date,
              version,
              metric,
              dimension,
              context,
              sum(value) AS value
       FROM applicationRegistrationMetric
       WHERE ${PERIOD_WHERE_CLAUSE}
       GROUP BY date, version, metric, dimension, context
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
      `SELECT uniqExact(workspaceHash) AS activeWorkspaces
       FROM applicationRegistrationMetric
       WHERE ${ACTIVE_WORKSPACE_WHERE_CLAUSE}`,
      this.buildPeriodParams(params),
    );

    return Number(rows[0]?.activeWorkspaces ?? 0);
  }

  private async queryActiveWorkspacesByVersion(
    params: AnalyticsPeriodParams,
  ): Promise<ApplicationRegistrationVersionActiveWorkspacesRow[]> {
    return this.clickHouseService.selectOrThrow<ApplicationRegistrationVersionActiveWorkspacesRow>(
      `SELECT version,
              uniqExact(workspaceHash) AS activeWorkspaces
       FROM applicationRegistrationMetric
       WHERE ${ACTIVE_WORKSPACE_WHERE_CLAUSE}
         AND version != ''
       GROUP BY version`,
      this.buildPeriodParams(params),
    );
  }

  private async queryDailyActiveWorkspacesByVersion(
    params: AnalyticsPeriodParams,
  ): Promise<ApplicationRegistrationDailyVersionActiveWorkspacesRow[]> {
    return this.clickHouseService.selectOrThrow<ApplicationRegistrationDailyVersionActiveWorkspacesRow>(
      `SELECT ${DAY_EXPRESSION} AS date,
              version,
              uniqExact(workspaceHash) AS activeWorkspaces
       FROM applicationRegistrationMetric
       WHERE ${ACTIVE_WORKSPACE_WHERE_CLAUSE}
         AND version != ''
       GROUP BY date, version`,
      this.buildPeriodParams(params),
    );
  }
}
