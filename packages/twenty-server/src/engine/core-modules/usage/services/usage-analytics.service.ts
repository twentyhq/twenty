/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { fillUsageTimeSeriesGaps } from 'src/engine/core-modules/usage/utils/fill-usage-time-series-gaps.util';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { toDollars } from 'src/engine/core-modules/usage/utils/to-dollars.util';

export type UsageBreakdownItem = {
  key: string;
  label?: string;
  creditsUsed: number;
};

export type UsageApplicationBreakdownItem = {
  applicationId: string;
  operation: string;
  creditsUsed: number;
};

export type UsageTimeSeriesPoint = {
  date: string;
  creditsUsed: number;
};

type BreakdownRowMicro<TColumn extends string> = Record<TColumn, string> & {
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
  operationTypes?: string[];
};

const ALLOWED_GROUP_BY_FIELDS = [
  'userWorkspaceId',
  'resourceId',
  'operationType',
  'resourceType',
  'resourceContext',
] as const;

type GroupByField = (typeof ALLOWED_GROUP_BY_FIELDS)[number];

const BREAKDOWN_QUERY_LIMIT = 50;

@Injectable()
export class UsageAnalyticsService {
  constructor(private readonly clickHouseService: ClickHouseService) {}

  async getAdminAiUsageByWorkspace(params: {
    periodStart: Date;
    periodEnd: Date;
    useDollarMode?: boolean;
  }): Promise<UsageBreakdownItem[]> {
    const aiOperationTypes = ['AI_CHAT_TOKEN', 'AI_WORKFLOW_TOKEN'];

    const convert = params.useDollarMode ? toDollars : toDisplayCredits;

    const query = `
      SELECT
        workspaceId AS key,
        sum(creditsUsedMicro) AS creditsUsedMicro
      FROM usageEvent
      WHERE timestamp >= {periodStart:String}
        AND timestamp < {periodEnd:String}
        AND operationType IN ({operationTypes:Array(String)})
      GROUP BY workspaceId
      ORDER BY creditsUsedMicro DESC
      LIMIT ${BREAKDOWN_QUERY_LIMIT}
    `;

    const rows = await this.clickHouseService.select<BreakdownRowMicro<'key'>>(
      query,
      {
        periodStart: formatDateTimeForClickHouse(params.periodStart),
        periodEnd: formatDateTimeForClickHouse(params.periodEnd),
        operationTypes: aiOperationTypes,
      },
    );

    return rows.map((row) => ({
      key: row.key,
      creditsUsed: convert(row.creditsUsedMicro),
    }));
  }

  async getUsageByUser(params: PeriodParams): Promise<UsageBreakdownItem[]> {
    const rows = await this.queryBreakdown({
      ...params,
      groupByFields: ['userWorkspaceId'],
      extraWhere: "AND userWorkspaceId != ''",
    });

    return rows.map((row) => ({
      key: row.userWorkspaceId,
      creditsUsed: row.creditsUsedMicro,
    }));
  }

  async getUsageByModel(params: PeriodParams): Promise<UsageBreakdownItem[]> {
    const rows = await this.queryBreakdown({
      ...params,
      groupByFields: ['resourceContext'],
      extraWhere: "AND resourceContext != ''",
    });

    return rows.map((row) => ({
      key: row.resourceContext,
      creditsUsed: row.creditsUsedMicro,
    }));
  }

  async getUsageByOperationType(
    params: PeriodParams & { userWorkspaceId?: string },
  ): Promise<UsageBreakdownItem[]> {
    const rows = await this.queryBreakdown({
      ...params,
      groupByFields: ['operationType'],
      ...(params.userWorkspaceId && {
        extraWhere: 'AND userWorkspaceId = {userWorkspaceId:String}',
        extraParams: { userWorkspaceId: params.userWorkspaceId },
      }),
    });

    return rows.map((row) => ({
      key: row.operationType,
      creditsUsed: row.creditsUsedMicro,
    }));
  }

  // Apps pick their operation type from a closed platform enum, so unrelated
  // apps merge under whichever one they picked. Grouping on the application
  // and on the operation it declared answers "what did this app charge me
  // for" without disturbing the operation-type breakdown, which still
  // accounts for every credit.
  async getUsageByApplication(
    params: PeriodParams & { userWorkspaceId?: string },
  ): Promise<UsageApplicationBreakdownItem[]> {
    const rows = await this.queryBreakdown({
      ...params,
      groupByFields: ['resourceId', 'resourceContext'],
      extraWhere: [
        'AND resourceType = {appResourceType:String}',
        "AND resourceId != ''",
        ...(params.userWorkspaceId
          ? ['AND userWorkspaceId = {userWorkspaceId:String}']
          : []),
      ].join(' '),
      extraParams: {
        appResourceType: UsageResourceType.APP,
        ...(params.userWorkspaceId
          ? { userWorkspaceId: params.userWorkspaceId }
          : {}),
      },
    });

    return rows.map((row) => ({
      applicationId: row.resourceId,
      operation: row.resourceContext,
      creditsUsed: row.creditsUsedMicro,
    }));
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

  private async queryBreakdown<const TFields extends readonly GroupByField[]>({
    workspaceId,
    periodStart,
    periodEnd,
    groupByFields,
    operationTypes,
    extraWhere = '',
    extraParams,
  }: PeriodParams & {
    groupByFields: TFields;
    extraWhere?: string;
    extraParams?: Record<string, unknown>;
  }): Promise<BreakdownRowMicro<TFields[number]>[]> {
    for (const groupByField of groupByFields) {
      if (!ALLOWED_GROUP_BY_FIELDS.includes(groupByField)) {
        throw new Error(`Invalid groupByField: ${groupByField}`);
      }
    }

    const opTypeFilter =
      operationTypes && operationTypes.length > 0
        ? 'AND operationType IN ({operationTypes:Array(String)})'
        : '';

    const groupBy = groupByFields.join(', ');

    const query = `
      SELECT
        ${groupBy},
        sum(creditsUsedMicro) AS creditsUsedMicro
      FROM usageEvent
      WHERE workspaceId = {workspaceId:String}
        AND timestamp >= {periodStart:String}
        AND timestamp < {periodEnd:String}
        ${opTypeFilter}
        ${extraWhere}
      GROUP BY ${groupBy}
      ORDER BY creditsUsedMicro DESC
      LIMIT ${BREAKDOWN_QUERY_LIMIT}
    `;

    return this.clickHouseService.select<BreakdownRowMicro<TFields[number]>>(
      query,
      {
        workspaceId,
        periodStart: formatDateTimeForClickHouse(periodStart),
        periodEnd: formatDateTimeForClickHouse(periodEnd),
        ...(operationTypes && operationTypes.length > 0
          ? { operationTypes }
          : {}),
        ...(extraParams ?? {}),
      },
    );
  }

  private async queryTimeSeries({
    workspaceId,
    periodStart,
    periodEnd,
    operationTypes,
    extraWhere = '',
    extraParams,
  }: PeriodParams & {
    extraWhere?: string;
    extraParams?: Record<string, unknown>;
  }): Promise<UsageTimeSeriesPoint[]> {
    const opTypeFilter =
      operationTypes && operationTypes.length > 0
        ? 'AND operationType IN ({operationTypes:Array(String)})'
        : '';

    const query = `
      SELECT
        formatDateTime(timestamp, '%Y-%m-%d') AS date,
        sum(creditsUsedMicro) AS creditsUsedMicro
      FROM usageEvent
      WHERE workspaceId = {workspaceId:String}
        AND timestamp >= {periodStart:String}
        AND timestamp < {periodEnd:String}
        ${opTypeFilter}
        ${extraWhere}
      GROUP BY date
      ORDER BY date ASC
    `;

    const rows = await this.clickHouseService.select<TimeSeriesRowMicro>(
      query,
      {
        workspaceId,
        periodStart: formatDateTimeForClickHouse(periodStart),
        periodEnd: formatDateTimeForClickHouse(periodEnd),
        ...(operationTypes && operationTypes.length > 0
          ? { operationTypes }
          : {}),
        ...(extraParams ?? {}),
      },
    );

    const points = rows.map((row) => ({
      date: row.date,
      creditsUsed: row.creditsUsedMicro,
    }));

    return fillUsageTimeSeriesGaps({
      rows: points,
      periodStart,
      periodEnd,
    });
  }
}
