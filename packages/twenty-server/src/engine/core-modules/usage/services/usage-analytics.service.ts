/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { formatDateForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';

export type UsageBreakdownItem = {
  key: string;
  label?: string;
  creditsUsed: number;
};

export type UsageTimeSeriesPoint = {
  date: string;
  creditsUsed: number;
};

type BreakdownRowMicro = {
  key: string;
  creditsUsedMicro: number;
};

type TimeSeriesRowMicro = {
  date: string;
  creditsUsedMicro: number;
};

type PeriodParams = {
  workspaceId: string;
  periodStart: Date;
  periodEnd: Date;
};

const ALLOWED_GROUP_BY_FIELDS = [
  'userWorkspaceId',
  'resourceId',
  'operationType',
  'resourceType',
] as const;

type GroupByField = (typeof ALLOWED_GROUP_BY_FIELDS)[number];

const BREAKDOWN_QUERY_LIMIT = 50;

@Injectable()
export class UsageAnalyticsService {
  constructor(private readonly clickHouseService: ClickHouseService) {}

  async getUsageByUser(params: PeriodParams): Promise<UsageBreakdownItem[]> {
    return this.queryBreakdown({
      ...params,
      groupByField: 'userWorkspaceId',
      extraWhere: "AND userWorkspaceId != ''",
    });
  }

  async getUsageByOperationType(
    params: PeriodParams & { userWorkspaceId?: string },
  ): Promise<UsageBreakdownItem[]> {
    return this.queryBreakdown({
      ...params,
      groupByField: 'operationType',
      ...(params.userWorkspaceId && {
        extraWhere: 'AND userWorkspaceId = {userWorkspaceId:String}',
        extraParams: { userWorkspaceId: params.userWorkspaceId },
      }),
    });
  }

  async getUsageByUserTimeSeries(
    params: PeriodParams & { userWorkspaceId: string },
  ): Promise<UsageTimeSeriesPoint[]> {
    return this.queryTimeSeries({
      ...params,
      extraWhere: 'AND userWorkspaceId = {userWorkspaceId:String}',
      extraParams: { userWorkspaceId: params.userWorkspaceId },
    });
  }

  async getUsageTimeSeries(
    params: PeriodParams,
  ): Promise<UsageTimeSeriesPoint[]> {
    return this.queryTimeSeries(params);
  }

  private async queryBreakdown({
    workspaceId,
    periodStart,
    periodEnd,
    groupByField,
    extraWhere = '',
    extraParams,
  }: PeriodParams & {
    groupByField: GroupByField;
    extraWhere?: string;
    extraParams?: Record<string, unknown>;
  }): Promise<UsageBreakdownItem[]> {
    const query = `
      SELECT
        ${groupByField} AS key,
        sum(creditsUsedMicro) AS creditsUsedMicro
      FROM usageEvent
      WHERE workspaceId = {workspaceId:String}
        AND timestamp >= {periodStart:String}
        AND timestamp < {periodEnd:String}
        ${extraWhere}
      GROUP BY ${groupByField}
      ORDER BY creditsUsedMicro DESC
      LIMIT ${BREAKDOWN_QUERY_LIMIT}
    `;

    const rows = await this.clickHouseService.select<BreakdownRowMicro>(query, {
      workspaceId,
      periodStart: formatDateForClickHouse(periodStart),
      periodEnd: formatDateForClickHouse(periodEnd),
      ...(extraParams ?? {}),
    });

    return rows.map((row) => ({
      key: row.key,
      creditsUsed: toDisplayCredits(row.creditsUsedMicro),
    }));
  }

  private async queryTimeSeries({
    workspaceId,
    periodStart,
    periodEnd,
    extraWhere = '',
    extraParams,
  }: PeriodParams & {
    extraWhere?: string;
    extraParams?: Record<string, unknown>;
  }): Promise<UsageTimeSeriesPoint[]> {
    const query = `
      SELECT
        formatDateTime(timestamp, '%Y-%m-%d') AS date,
        sum(creditsUsedMicro) AS creditsUsedMicro
      FROM usageEvent
      WHERE workspaceId = {workspaceId:String}
        AND timestamp >= {periodStart:String}
        AND timestamp < {periodEnd:String}
        ${extraWhere}
      GROUP BY date
      ORDER BY date ASC
    `;

    const rows = await this.clickHouseService.select<TimeSeriesRowMicro>(
      query,
      {
        workspaceId,
        periodStart: formatDateForClickHouse(periodStart),
        periodEnd: formatDateForClickHouse(periodEnd),
        ...(extraParams ?? {}),
      },
    );

    return rows.map((row) => ({
      date: row.date,
      creditsUsed: toDisplayCredits(row.creditsUsedMicro),
    }));
  }
}
