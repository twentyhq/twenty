/* @license Enterprise */

import { isNonEmptyString } from '@sniptt/guards';

import { Injectable } from '@nestjs/common';

import { isNonEmptyArray } from 'twenty-shared/utils';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { parseClickHouseDateTime } from 'src/database/clickhouse/utils/parse-clickhouse-date-time.util';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type CreditUsedItemDTO } from 'src/engine/core-modules/usage/dtos/credit-used-item.dto';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type UsageConsumptionRow } from 'src/engine/core-modules/usage/types/usage-consumption-row.type';
import { type UsageConsumptionTotals } from 'src/engine/core-modules/usage/types/usage-consumption-totals.type';
import { type UsagePeriodAnchor } from 'src/engine/core-modules/usage/types/usage-period-anchor.type';
import { type CreditsUsed } from 'src/engine/core-modules/usage/types/credits-used.type';
import { buildInstallationFilterParams } from 'src/engine/core-modules/usage/utils/build-installation-filter-params.util';
import { buildRecurringChargeKey } from 'src/engine/core-modules/usage/utils/build-recurring-charge-key.util';
import { buildUsagePeriodClause } from 'src/engine/core-modules/usage/utils/build-usage-period-clause.util';
import { buildUsageResourceTypeFilter } from 'src/engine/core-modules/usage/utils/build-usage-resource-type-filter.util';
import { buildUsageScopeFilter } from 'src/engine/core-modules/usage/utils/build-usage-scope-filter.util';
import { fillUsageTimeSeriesGaps } from 'src/engine/core-modules/usage/utils/fill-usage-time-series-gaps.util';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { toDollars } from 'src/engine/core-modules/usage/utils/to-dollars.util';

type CreditsUsedAmounts = {
  creditsUsed: number;
  userCreditsUsed: number;
  workspaceCreditsUsed: number;
};

export type UsageBreakdownItem = CreditsUsedAmounts & {
  key: string;
  label?: string;
};

export type UsageApplicationBreakdownItem = CreditsUsedAmounts & {
  applicationId: string;
  operation: string;
};

export type UsageTimeSeriesPoint = {
  date: string;
  creditsUsed: number;
  workspaceCreditsUsed: number;
};

type CreditsUsedRowMicro = {
  creditsUsedMicro: string | number;
  userCreditsUsedMicro: string | number;
  workspaceCreditsUsedMicro: string | number;
};

type BreakdownRowMicro<TColumn extends string> = Record<TColumn, string> &
  CreditsUsedRowMicro;

// ClickHouse binds creditsUsedMicro and userCreditsUsedMicro to these sum aliases anywhere in the query, so sum() over them nests an aggregate and fails
const CREDITS_USED_SELECT = `sum(creditsUsedMicro) AS creditsUsedMicro,
        sum(userCreditsUsedMicro) AS userCreditsUsedMicro,
        creditsUsedMicro - userCreditsUsedMicro AS workspaceCreditsUsedMicro`;

const toCreditsUsedAmounts = (
  row: CreditsUsedRowMicro,
): CreditsUsedAmounts => ({
  creditsUsed: Number(row.creditsUsedMicro),
  userCreditsUsed: Number(row.userCreditsUsedMicro),
  workspaceCreditsUsed: Number(row.workspaceCreditsUsedMicro),
});

type TimeSeriesRowMicro = CreditsUsedRowMicro & {
  date: string;
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

// Scopes a declared operation to its application; both sides of the comparison use it so they cannot spell the pair differently.
const DECLARED_OPERATION_KEY_SEPARATOR = ':';

const USAGE_OPERATION_TYPES = new Set<string>(
  Object.values(UsageOperationType),
);

const USAGE_RESOURCE_TYPES = new Set<string>(Object.values(UsageResourceType));

@Injectable()
export class UsageAnalyticsService {
  constructor(private readonly clickHouseService: ClickHouseService) {}

  async getCreditsUsedBreakdownForInstallations({
    installations,
    periodStart,
    periodEnd,
  }: {
    installations: { applicationId: string; workspaceId: string }[];
    periodStart: Date;
    periodEnd: Date;
  }): Promise<CreditUsedItemDTO[]> {
    if (!isNonEmptyArray(installations)) {
      return [];
    }

    const rows = await this.clickHouseService.selectOrThrow<{
      resourceType: string;
      operationType: string;
      creditsUsedMicro: string | number;
    }>(
      `SELECT resourceType, operationType, sum(creditsUsedMicro) AS creditsUsedMicro
       FROM usageEvent
       WHERE workspaceId IN {workspaceIds:Array(String)}
         AND applicationId IN {applicationIds:Array(String)}
         AND timestamp >= {periodStart:DateTime64(3, 'UTC')}
         AND timestamp < {periodEnd:DateTime64(3, 'UTC')}
       GROUP BY resourceType, operationType
       HAVING creditsUsedMicro != 0
       ORDER BY creditsUsedMicro DESC
       SETTINGS max_execution_time = 10, use_query_cache = true,
                query_cache_ttl = 600, query_cache_min_query_duration = 0`,
      {
        ...buildInstallationFilterParams(installations),
        periodStart: formatDateTimeForClickHouse(periodStart),
        periodEnd: formatDateTimeForClickHouse(periodEnd),
      },
    );

    return rows.map(({ resourceType, operationType, creditsUsedMicro }) => {
      const isKnownOperation = USAGE_OPERATION_TYPES.has(operationType);

      return {
        resource: USAGE_RESOURCE_TYPES.has(resourceType)
          ? (resourceType as UsageResourceType)
          : null,
        operation: isKnownOperation
          ? (operationType as UsageOperationType)
          : null,
        label: isKnownOperation ? undefined : operationType,
        creditsUsed: toDisplayCredits(Number(creditsUsedMicro)),
      };
    });
  }

  async getCreditsUsedTimeSeriesForInstallations({
    installations,
    periodStart,
    periodEnd,
    bucketSizeInSeconds,
  }: {
    installations: { applicationId: string; workspaceId: string }[];
    periodStart: Date;
    periodEnd: Date;
    bucketSizeInSeconds: number;
  }): Promise<
    {
      bucketStart: Date;
      operationType: string;
      creditsUsedMicro: number;
    }[]
  > {
    if (!isNonEmptyArray(installations)) {
      return [];
    }

    const rows = await this.clickHouseService.selectOrThrow<{
      bucketStart: string;
      operationType: string;
      creditsUsedMicro: string | number;
    }>(
      `SELECT
         toStartOfInterval(timestamp, toIntervalSecond({bucketSizeInSeconds:UInt32})) AS bucketStart,
         operationType,
         sum(creditsUsedMicro) AS creditsUsedMicro
       FROM usageEvent
       WHERE workspaceId IN {workspaceIds:Array(String)}
         AND applicationId IN {applicationIds:Array(String)}
         AND timestamp >= {periodStart:DateTime64(3, 'UTC')}
         AND timestamp < {periodEnd:DateTime64(3, 'UTC')}
       GROUP BY bucketStart, operationType
       HAVING creditsUsedMicro != 0
       ORDER BY bucketStart, operationType
       SETTINGS max_execution_time = 10`,
      {
        ...buildInstallationFilterParams(installations),
        periodStart: formatDateTimeForClickHouse(periodStart),
        periodEnd: formatDateTimeForClickHouse(periodEnd),
        bucketSizeInSeconds,
      },
    );

    return rows.map(({ bucketStart, operationType, creditsUsedMicro }) => ({
      bucketStart: parseClickHouseDateTime(bucketStart),
      operationType,
      creditsUsedMicro: Number(creditsUsedMicro),
    }));
  }

  async getConsumptionRowsForAllScopes({
    workspaceId,
    resourceType,
    periodStart,
    periodEnd,
    periodAnchor,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
    periodStart: Date;
    periodEnd: Date;
    periodAnchor: UsagePeriodAnchor;
  }): Promise<UsageConsumptionRow[]> {
    const periodClause = buildUsagePeriodClause(periodAnchor);
    const resourceTypeFilter = buildUsageResourceTypeFilter(resourceType);

    // Grouped again so the shape matches the consumption_by_scope projection, which is picked only on a full key match.
    return this.clickHouseService.selectOrThrow<UsageConsumptionRow>(
      `SELECT operationType, unit, userWorkspaceId, apiKeyId, applicationId,
              agentId, workflowId, logicFunctionId,
              ${CREDITS_USED_SELECT},
              sum(quantity) AS quantity
       FROM usageEvent
       WHERE workspaceId = {workspaceId:String}
         ${resourceTypeFilter.clause}
         ${periodClause}
       GROUP BY operationType, unit, userWorkspaceId, apiKeyId, applicationId,
                agentId, workflowId, logicFunctionId`,
      {
        workspaceId,
        ...resourceTypeFilter.params,
        periodStart: formatDateTimeForClickHouse(periodStart),
        periodEnd: formatDateTimeForClickHouse(periodEnd),
      },
    );
  }

  async getConsumptionTotalsForScope({
    workspaceId,
    resourceType,
    operationType,
    unit,
    spenderType,
    spenderId,
    periodStart,
    periodEnd,
    periodAnchor,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
    operationType: UsageOperationType;
    unit: UsageUnit | null;
    spenderType: SpenderType;
    spenderId: string | null;
    periodStart: Date;
    periodEnd: Date;
    periodAnchor: UsagePeriodAnchor;
  }): Promise<UsageConsumptionTotals> {
    const resourceTypeFilter = buildUsageResourceTypeFilter(resourceType);
    const scopeFilter = buildUsageScopeFilter({
      operationType,
      unit,
      spenderType,
      spenderId,
    });

    const rows =
      await this.clickHouseService.selectOrThrow<UsageConsumptionTotals>(
        `SELECT ${CREDITS_USED_SELECT},
                sum(quantity) AS quantity
         FROM usageEvent
         WHERE workspaceId = {workspaceId:String}
           ${resourceTypeFilter.clause}
           ${buildUsagePeriodClause(periodAnchor)}
           ${scopeFilter.clause}`,
        {
          workspaceId,
          ...resourceTypeFilter.params,
          periodStart: formatDateTimeForClickHouse(periodStart),
          periodEnd: formatDateTimeForClickHouse(periodEnd),
          ...scopeFilter.params,
        },
      );

    return {
      creditsUsedMicro: rows[0]?.creditsUsedMicro ?? 0,
      userCreditsUsedMicro: rows[0]?.userCreditsUsedMicro ?? 0,
      workspaceCreditsUsedMicro: rows[0]?.workspaceCreditsUsedMicro ?? 0,
      quantity: rows[0]?.quantity ?? 0,
    };
  }

  async getCreditsUsedMicroForBillingPeriod({
    workspaceId,
    periodStart,
  }: {
    workspaceId: string;
    periodStart: Date;
  }): Promise<CreditsUsed> {
    // The grouping only exists to match the billing_by_workspace_period projection; it still returns one row.
    const rows =
      await this.clickHouseService.selectOrThrow<CreditsUsedRowMicro>(
        `SELECT ${CREDITS_USED_SELECT}
         FROM usageEvent
         WHERE workspaceId = {workspaceId:String}
           AND periodStart = {periodStart:DateTime64(3)}
         GROUP BY workspaceId, periodStart`,
        { workspaceId, periodStart: formatDateTimeForClickHouse(periodStart) },
      );

    return {
      workspaceCreditsUsedMicro: Number(
        rows[0]?.workspaceCreditsUsedMicro ?? 0,
      ),
      userCreditsUsedMicro: Number(rows[0]?.userCreditsUsedMicro ?? 0),
    };
  }

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
        ${CREDITS_USED_SELECT}
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
      creditsUsed: convert(Number(row.creditsUsedMicro)),
      userCreditsUsed: convert(Number(row.userCreditsUsedMicro)),
      workspaceCreditsUsed: convert(Number(row.workspaceCreditsUsedMicro)),
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

  // Apps share a closed operation-type enum, so grouping on the app and its declared operation shows what each app charged.
  // Undeclared contexts collapse here rather than in the resolver, so the limit truncates displayed slices.
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
        ${CREDITS_USED_SELECT}
      FROM usageEvent
      WHERE workspaceId = {workspaceId:String}
        AND timestamp >= {periodStart:String}
        AND timestamp < {periodEnd:String}
        AND resourceType = {appResourceType:String}
        AND resourceId != ''
        ${hasOperationTypes ? 'AND operationType IN ({operationTypes:Array(String)})' : ''}
        ${isNonEmptyString(userWorkspaceId) ? 'AND userWorkspaceId = {userWorkspaceId:String}' : ''}
      GROUP BY resourceId, operation
      ORDER BY workspaceCreditsUsedMicro DESC
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
      ...toCreditsUsedAmounts(row),
    }));
  }

  // The usage row is the record of the charge; >= so a truncated timestamp cannot miss the current period.
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

    const rows = await this.clickHouseService.selectOrThrow<
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
        ${CREDITS_USED_SELECT}
      FROM usageEvent
      WHERE workspaceId = {workspaceId:String}
        AND timestamp >= {periodStart:String}
        AND timestamp < {periodEnd:String}
        ${opTypeFilter}
        ${extraWhere}
      GROUP BY ${groupByField}
      ORDER BY workspaceCreditsUsedMicro DESC
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
      ...toCreditsUsedAmounts(row),
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
        ${CREDITS_USED_SELECT}
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
      creditsUsed: Number(row.creditsUsedMicro),
      workspaceCreditsUsed: Number(row.workspaceCreditsUsedMicro),
    }));

    return fillUsageTimeSeriesGaps({
      rows: points,
      periodStart,
      periodEnd,
    });
  }
}
