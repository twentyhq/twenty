import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { SETTLE_QUOTA_COUNTERS_SCRIPT } from 'src/engine/core-modules/usage-limit/constants/settle-quota-counters-script.constant';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageAllowanceResolver } from 'src/engine/core-modules/usage-limit/interfaces/usage-allowance-resolver.interface';
import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type QuotaBound } from 'src/engine/core-modules/usage-limit/types/quota-bound.type';
import { type QuotaConsumptionRow } from 'src/engine/core-modules/usage-limit/types/quota-consumption-row.type';
import { type QuotaCost } from 'src/engine/core-modules/usage-limit/types/quota-cost.type';
import { buildQuotaBounds } from 'src/engine/core-modules/usage-limit/utils/build-quota-bounds.util';
import { buildQuotaWarmLockKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-warm-lock-key.util';
import { computeQuotaConsumed } from 'src/engine/core-modules/usage-limit/utils/compute-quota-consumed.util';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import {
  type AnchoredPeriodUnit,
  UsagePeriodService,
} from 'src/engine/core-modules/usage/services/usage-period.service';
import { type UsagePeriod } from 'src/engine/core-modules/usage/types/usage-period.type';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';
import { WorkspaceCacheException } from 'src/engine/workspace-cache/exceptions/workspace-cache.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const QUOTA_WARM_LOCK_OPTIONS = { ms: 50, maxRetries: 20, ttl: 10_000 };

type QuotaConsumeArgs = {
  workspaceId: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenders: UsageSpenders;
};

@Injectable()
export class UsageLimitQuotaService {
  private readonly logger = new Logger(UsageLimitQuotaService.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineUsageLimit)
    private readonly cacheStorage: CacheStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly cacheLockService: CacheLockService,
    private readonly clickHouseService: ClickHouseService,
    private readonly usagePeriodService: UsagePeriodService,
    private readonly usageAllowanceResolver: UsageAllowanceResolver,
  ) {}

  async assertCanConsume(args: QuotaConsumeArgs): Promise<void> {
    const exhaustedRuleScope =
      await this.findExhaustedRuleScopeAdmittingOnFailure(args);

    if (isDefined(exhaustedRuleScope)) {
      this.throwQuotaExhausted(exhaustedRuleScope);
    }

    const poolAvailability =
      await this.usageAllowanceResolver.getPoolAvailability(args.workspaceId);

    if (poolAvailability === 'exhausted') {
      this.throwQuotaExhausted(await this.buildPoolExhaustedScope(args));
    }
  }

  async settle({
    cost,
    ...args
  }: QuotaConsumeArgs & { cost: QuotaCost }): Promise<{
    exhausted: ExhaustedScope | null;
  }> {
    const exhaustedRuleScope = await this.settleRuleCountersAdmittingOnFailure({
      ...args,
      cost,
    });

    const poolRemainingMicro =
      await this.usageAllowanceResolver.consumeCreditsMicro(
        args.workspaceId,
        cost.creditsUsedMicro,
      );

    if (isDefined(exhaustedRuleScope)) {
      return { exhausted: exhaustedRuleScope };
    }

    if (isDefined(poolRemainingMicro) && poolRemainingMicro <= 0) {
      return { exhausted: await this.buildPoolExhaustedScope(args) };
    }

    return { exhausted: null };
  }

  private async findExhaustedRuleScopeAdmittingOnFailure(
    args: QuotaConsumeArgs,
  ): Promise<ExhaustedScope | null> {
    try {
      const bounds = await this.resolveBounds(args);

      if (bounds.length === 0) {
        return null;
      }

      const remainings = await this.readRemainings({
        workspaceId: args.workspaceId,
        resourceType: args.resourceType,
        bounds,
      });

      return this.findExhaustedScope({
        resourceType: args.resourceType,
        bounds,
        remainings,
      });
    } catch (error) {
      return this.admitOnFailure(error);
    }
  }

  private async settleRuleCountersAdmittingOnFailure({
    cost,
    ...args
  }: QuotaConsumeArgs & { cost: QuotaCost }): Promise<ExhaustedScope | null> {
    try {
      const bounds = await this.resolveBounds(args);

      if (bounds.length === 0) {
        return null;
      }

      const settleResults = await this.cacheStorage.runScript<number[]>({
        script: SETTLE_QUOTA_COUNTERS_SCRIPT,
        keys: bounds.map((bound) => bound.key),
        args: [JSON.stringify(bounds.map((bound) => cost[bound.meter]))],
      });

      const remainings = bounds.map((_, index) => {
        const existed = settleResults[2 * index] === 1;

        return existed ? settleResults[2 * index + 1] : null;
      });

      return this.findExhaustedScope({
        resourceType: args.resourceType,
        bounds,
        remainings,
      });
    } catch (error) {
      return this.admitOnFailure(error);
    }
  }

  private findExhaustedScope({
    resourceType,
    bounds,
    remainings,
  }: {
    resourceType: UsageResourceType;
    bounds: QuotaBound[];
    remainings: (number | null)[];
  }): ExhaustedScope | null {
    const exhaustedIndex = remainings.findIndex(
      (remaining) => isDefined(remaining) && remaining <= 0,
    );

    if (exhaustedIndex === -1) {
      return null;
    }

    const bound = bounds[exhaustedIndex];

    return {
      resourceType,
      limitKind: 'quota',
      spenderType: bound.spenderType,
      spenderId: bound.spenderId,
      operationType: bound.operationType,
      limitValue: bound.limitValue,
      remaining: 0,
      periodCount: 1,
      periodUnit: bound.periodUnit,
      retryAfterMs: Math.max(bound.periodEnd.getTime() - Date.now(), 0),
      isDefault: false,
    };
  }

  private async buildPoolExhaustedScope({
    workspaceId,
    resourceType,
  }: QuotaConsumeArgs): Promise<ExhaustedScope> {
    const [allowanceMicro, period] = await Promise.all([
      this.usageAllowanceResolver.getAllowanceMicro(workspaceId),
      this.usagePeriodService.getCurrentPeriod(workspaceId),
    ]);

    return {
      resourceType,
      limitKind: 'quota',
      spenderType: 'workspace',
      spenderId: null,
      operationType: UsageOperationType.ALL,
      limitValue: allowanceMicro ?? 0,
      remaining: 0,
      periodCount: 1,
      periodUnit: 'billingPeriod',
      retryAfterMs: Math.max(period.periodEnd.getTime() - Date.now(), 0),
      isDefault: true,
    };
  }

  private throwQuotaExhausted(exhaustedScope: ExhaustedScope): never {
    throw new UsageLimitException(
      `Usage quota exhausted for ${exhaustedScope.spenderType}`,
      UsageLimitExceptionCode.QUOTA_EXHAUSTED,
      { exhaustedScope },
    );
  }

  private admitOnFailure(error: unknown): null {
    if (
      error instanceof WorkspaceCacheException ||
      error instanceof UsageLimitException
    ) {
      throw error;
    }

    this.logger.error(
      `Usage quota enforcement degraded: ${error instanceof Error ? error.message : 'unknown error'}`,
    );

    return null;
  }

  private async resolveBounds({
    workspaceId,
    resourceType,
    operationType,
    spenders,
  }: QuotaConsumeArgs): Promise<QuotaBound[]> {
    const definition = findUsageLimitDefinition({
      resourceType,
      limitKind: 'quota',
    });

    if (!isDefined(definition)) {
      return [];
    }

    const quotaRules = await this.findQuotaRules({ workspaceId, resourceType });

    if (quotaRules.length === 0) {
      return [];
    }

    const periodByUnit = await this.resolvePeriodsByUnit({
      workspaceId,
      quotaRules,
    });

    const hasPercentRule = quotaRules.some(
      (rule) => rule.limitValueType === 'percent',
    );

    const allowanceMicro = hasPercentRule
      ? await this.usageAllowanceResolver.getAllowanceMicro(workspaceId)
      : null;

    return buildQuotaBounds({
      rules: quotaRules,
      usageSpenders: spenders,
      workspaceId,
      resourceType,
      operationType,
      periodByUnit,
      allowanceMicro,
    });
  }

  private async resolvePeriodsByUnit({
    workspaceId,
    quotaRules,
  }: {
    workspaceId: string;
    quotaRules: FlatUsageLimit[];
  }): Promise<Partial<Record<PeriodUnit, UsagePeriod>>> {
    const periodUnits = [
      ...new Set(
        quotaRules
          .map((rule) => rule.periodUnit)
          .filter(
            (periodUnit): periodUnit is AnchoredPeriodUnit =>
              periodUnit !== 'second',
          ),
      ),
    ];

    const periods = await Promise.all(
      periodUnits.map((periodUnit) =>
        this.usagePeriodService.getCurrentPeriod(workspaceId, periodUnit),
      ),
    );

    return Object.fromEntries(
      periodUnits.map((periodUnit, index) => [periodUnit, periods[index]]),
    );
  }

  private async findQuotaRules({
    workspaceId,
    resourceType,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
  }): Promise<FlatUsageLimit[]> {
    const { usageLimitRules } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['usageLimitRules'],
    );

    return (usageLimitRules.byResourceType[resourceType] ?? []).filter(
      (rule) => rule.limitKind === 'quota',
    );
  }

  private async readRemainings({
    workspaceId,
    resourceType,
    bounds,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
    bounds: QuotaBound[];
  }): Promise<(number | null)[]> {
    const remainings = await this.cacheStorage.mget<number>(
      bounds.map((bound) => bound.key),
    );

    if (remainings.every(isDefined)) {
      return remainings as number[];
    }

    return this.warmColdBounds({ workspaceId, resourceType, bounds });
  }

  private async warmColdBounds({
    workspaceId,
    resourceType,
    bounds,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
    bounds: QuotaBound[];
  }): Promise<(number | null)[]> {
    return this.cacheLockService.withLock(
      async () => {
        const remainings = await this.cacheStorage.mget<number>(
          bounds.map((bound) => bound.key),
        );

        if (remainings.every(isDefined)) {
          return remainings as number[];
        }

        const coldBounds = bounds.filter(
          (_, index) => !isDefined(remainings[index]),
        );

        const rowsByPeriod = await this.fetchConsumptionRowsByPeriod({
          workspaceId,
          resourceType,
          coldBounds,
        });

        const now = Date.now();

        const warmedEntries = coldBounds.flatMap((bound) => {
          const ttl = bound.periodEnd.getTime() - now;
          const rows = rowsByPeriod.get(buildPeriodGroupKey(bound));

          if (ttl <= 0 || !isDefined(rows)) {
            return [];
          }

          return [
            {
              key: bound.key,
              value: bound.limitValue - computeQuotaConsumed({ rows, bound }),
              ttl,
            },
          ];
        });

        await this.cacheStorage.mset(warmedEntries);

        const warmedValueByKey = new Map(
          warmedEntries.map((entry) => [entry.key, entry.value]),
        );

        return bounds.map(
          (bound, index) =>
            remainings[index] ?? warmedValueByKey.get(bound.key) ?? null,
        );
      },
      buildQuotaWarmLockKey(workspaceId),
      QUOTA_WARM_LOCK_OPTIONS,
    );
  }

  private async fetchConsumptionRowsByPeriod({
    workspaceId,
    resourceType,
    coldBounds,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
    coldBounds: QuotaBound[];
  }): Promise<Map<string, QuotaConsumptionRow[]>> {
    const boundsByPeriod = new Map<string, QuotaBound>();

    for (const bound of coldBounds) {
      boundsByPeriod.set(buildPeriodGroupKey(bound), bound);
    }

    const rowsByPeriod = new Map<string, QuotaConsumptionRow[]>();

    await Promise.all(
      [...boundsByPeriod.entries()].map(async ([periodGroupKey, bound]) => {
        rowsByPeriod.set(
          periodGroupKey,
          await this.fetchConsumptionRows({
            workspaceId,
            resourceType,
            bound,
          }),
        );
      }),
    );

    return rowsByPeriod;
  }

  private async fetchConsumptionRows({
    workspaceId,
    resourceType,
    bound,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
    bound: QuotaBound;
  }): Promise<QuotaConsumptionRow[]> {
    const periodCondition =
      bound.periodUnit === 'billingPeriod'
        ? 'periodStart = {periodStart:DateTime64(3)}'
        : 'timestamp >= {periodStart:DateTime64(3)} AND timestamp < {periodEnd:DateTime64(3)}';

    return this.clickHouseService.selectOrThrow<QuotaConsumptionRow>(
      `SELECT operationType, userWorkspaceId, apiKeyId, applicationId,
              sum(creditsUsedMicro) AS creditsUsedMicro,
              sum(quantity) AS quantity
       FROM usageEvent
       WHERE workspaceId = {workspaceId:String}
         AND resourceType = {resourceType:String}
         AND ${periodCondition}
       GROUP BY operationType, userWorkspaceId, apiKeyId, applicationId`,
      {
        workspaceId,
        resourceType,
        periodStart: formatDateTimeForClickHouse(bound.periodStart),
        periodEnd: formatDateTimeForClickHouse(bound.periodEnd),
      },
    );
  }
}

const buildPeriodGroupKey = (bound: QuotaBound): string =>
  `${bound.periodUnit}:${bound.periodStart.getTime()}`;
