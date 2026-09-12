/* @license Enterprise */

import { isNonEmptyString } from '@sniptt/guards';

import { Injectable } from '@nestjs/common';

import { isNonEmptyArray } from 'twenty-shared/utils';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { buildRecurringChargeKey } from 'src/engine/core-modules/usage/utils/build-recurring-charge-key.util';
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

// Scopes a declared operation name to the application that declared it. Both
// halves of the comparison are built here so the SQL and the array it is
// matched against cannot spell the pair differently.
const DECLARED_OPERATION_KEY_SEPARATOR = ':';

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
    return this.queryBreakdown({
      ...params,
      groupByField: 'userWorkspaceId',
      extraWhere: "AND userWorkspaceId != ''",
    });
  }

  async getUsageByModel(params: PeriodParams): Promise<UsageBreakdownItem[]> {
    return this.queryBreakdown({
      ...params,
      groupByField: 'resourceContext',
      extraWhere: "AND resourceContext != ''",
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

  // Apps pick their operation type from a closed platform enum, so unrelated
  // apps merge under whichever one they picked. Grouping on the application
  // and on the operation it declared answers "what did this app charge me
  // for" without disturbing the operation-type breakdown, which still
  // accounts for every credit.
  //
  // Contexts the app never declared collapse here rather than in the
  // resolver, so a row is a displayed slice and the limit truncates the same
  // way it does for every other breakdown.
  async getUsageByApplication({
    workspaceId,
    periodStart,
    periodEnd,
    operationTypes,
    userWorkspaceId,
    declaredOperationsByApplicationId,
  }: PeriodParams & {
    userWorkspaceId?: string;
    declaredOperationsByApplicationId: Record<string, string[]>;
  }): Promise<UsageApplicationBreakdownItem[]> {
    const hasOperationTypes = isNonEmptyArray(operationTypes);
    const declaredOperationKeys = Object.entries(
      declaredOperationsByApplicationId,
    ).flatMap(([applicationId, operations]) =>
      operations.map(
        (operation) =>
          `${applicationId}${DECLARED_OPERATION_KEY_SEPARATOR}${operation}`,
      ),
    );

    const query = `
      SELECT
        resourceId,
        if(
          has(
            {declaredOperationKeys:Array(String)},
            concat(
              resourceId,
              {declaredOperationKeySeparator:String},
              resourceContext
            )
          ),
          resourceContext,
          ''
        ) AS operation,
        sum(creditsUsedMicro) AS creditsUsedMicro
      FROM usageEvent
      WHERE workspaceId = {workspaceId:String}
        AND timestamp >= {periodStart:String}
        AND timestamp < {periodEnd:String}
        AND resourceType = {appResourceType:String}
        AND resourceId != ''
        ${hasOperationTypes ? 'AND operationType IN ({operationTypes:Array(String)})' : ''}
        ${isNonEmptyString(userWorkspaceId) ? 'AND userWorkspaceId = {userWorkspaceId:String}' : ''}
      GROUP BY resourceId, operation
      ORDER BY creditsUsedMicro DESC
      LIMIT ${BREAKDOWN_QUERY_LIMIT}
    `;

    const rows = await this.clickHouseService.select<
      BreakdownRowMicro<'resourceId' | 'operation'>
    >(query, {
      workspaceId,
      periodStart: formatDateTimeForClickHouse(periodStart),
      periodEnd: formatDateTimeForClickHouse(periodEnd),
      appResourceType: UsageResourceType.APP,
      declaredOperationKeys,
      declaredOperationKeySeparator: DECLARED_OPERATION_KEY_SEPARATOR,
      ...(hasOperationTypes ? { operationTypes } : {}),
      ...(isNonEmptyString(userWorkspaceId) ? { userWorkspaceId } : {}),
    });

    return rows.map((row) => ({
      applicationId: row.resourceId,
      operation: row.operation,
      creditsUsed: row.creditsUsedMicro,
    }));
  }

  // Which recurring charges an application has already been billed for in a
  // period. The usage row is itself the record of the charge, so re-running the
  // cron re-reads it instead of needing separate bookkeeping. Compared with >=
  // rather than = so a truncated timestamp cannot miss the current period.
  async getChargedRecurringKeys({
    workspaceId,
    periodStart,
  }: {
    workspaceId: string;
    periodStart: Date;
  }): Promise<Set<string>> {
    const query = `
      SELECT resourceId, resourceContext
      FROM usageEvent
      WHERE workspaceId = {workspaceId:String}
        AND resourceType = {appResourceType:String}
        AND operationType = {subscriptionOperationType:String}
        AND periodStart >= {periodStart:String}
      GROUP BY resourceId, resourceContext
    `;

    const rows = await this.clickHouseService.select<
      Record<'resourceId' | 'resourceContext', string>
    >(query, {
      workspaceId,
      appResourceType: UsageResourceType.APP,
      subscriptionOperationType: UsageOperationType.SUBSCRIPTION,
      periodStart: formatDateTimeForClickHouse(periodStart),
    });

    return new Set(
      rows.map((row) =>
        buildRecurringChargeKey({
          applicationId: row.resourceId,
          chargeKey: row.resourceContext,
        }),
      ),
    );
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
    operationTypes,
    extraWhere = '',
    extraParams,
  }: PeriodParams & {
    groupByField: GroupByField;
    extraWhere?: string;
    extraParams?: Record<string, unknown>;
  }): Promise<UsageBreakdownItem[]> {
    if (
      !ALLOWED_GROUP_BY_FIELDS.includes(
        groupByField as (typeof ALLOWED_GROUP_BY_FIELDS)[number],
      )
    ) {
      throw new Error(`Invalid groupByField: ${groupByField}`);
    }

    const opTypeFilter =
      operationTypes && operationTypes.length > 0
        ? 'AND operationType IN ({operationTypes:Array(String)})'
        : '';

    const query = `
      SELECT
        ${groupByField} AS key,
        sum(creditsUsedMicro) AS creditsUsedMicro
      FROM usageEvent
      WHERE workspaceId = {workspaceId:String}
        AND timestamp >= {periodStart:String}
        AND timestamp < {periodEnd:String}
        ${opTypeFilter}
        ${extraWhere}
      GROUP BY ${groupByField}
      ORDER BY creditsUsedMicro DESC
      LIMIT ${BREAKDOWN_QUERY_LIMIT}
    `;

    const rows = await this.clickHouseService.select<BreakdownRowMicro<'key'>>(
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

    return rows.map((row) => ({
      key: row.key,
      creditsUsed: row.creditsUsedMicro,
    }));
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
