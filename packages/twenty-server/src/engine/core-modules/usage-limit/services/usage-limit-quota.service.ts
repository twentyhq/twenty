import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { SETTLE_QUOTA_COUNTERS_SCRIPT } from 'src/engine/core-modules/usage-limit/constants/settle-quota-counters-script.constant';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { type UsagePoolAvailability } from 'src/engine/core-modules/usage-limit/types/usage-pool-availability.type';
import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { type QuotaConsumptionRow } from 'src/engine/core-modules/usage-limit/types/quota-consumption-row.type';
import { type QuotaCost } from 'src/engine/core-modules/usage-limit/types/quota-cost.type';
import { buildQuotaCounters } from 'src/engine/core-modules/usage-limit/utils/build-quota-counters.util';
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
    private readonly billingService: BillingService,
    private readonly billingUsageService: BillingUsageService,
  ) {}

  async assertCanConsume(args: QuotaConsumeArgs): Promise<void> {
    const exhaustedLimitScope =
      await this.findExhaustedLimitScopeAdmittingOnFailure(args);

    if (isDefined(exhaustedLimitScope)) {
      this.throwQuotaExhausted(exhaustedLimitScope);
    }

    const poolAvailability = await this.getPoolAvailability(args.workspaceId);

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
    const exhaustedLimitScope =
      await this.settleLimitCountersAdmittingOnFailure({
        ...args,
        cost,
      });

    const poolRemainingMicro = await this.consumeCreditsMicro(
      args.workspaceId,
      cost.creditsUsedMicro,
    );

    if (isDefined(exhaustedLimitScope)) {
      return { exhausted: exhaustedLimitScope };
    }

    if (isDefined(poolRemainingMicro) && poolRemainingMicro <= 0) {
      return { exhausted: await this.buildPoolExhaustedScope(args) };
    }

    return { exhausted: null };
  }

  private async findExhaustedLimitScopeAdmittingOnFailure(
    args: QuotaConsumeArgs,
  ): Promise<ExhaustedScope | null> {
    try {
      const counters = await this.resolveCounters(args);

      if (counters.length === 0) {
        return null;
      }

      const remainings = await this.readRemainings({
        workspaceId: args.workspaceId,
        resourceType: args.resourceType,
        counters,
      });

      return this.findExhaustedScope({
        resourceType: args.resourceType,
        counters,
        remainings,
      });
    } catch (error) {
      return this.admitOnFailure({ error, workspaceId: args.workspaceId });
    }
  }

  private async settleLimitCountersAdmittingOnFailure({
    cost,
    ...args
  }: QuotaConsumeArgs & { cost: QuotaCost }): Promise<ExhaustedScope | null> {
    try {
      const counters = await this.resolveCounters(args);

      if (counters.length === 0) {
        return null;
      }

      const settleResults = await this.cacheStorage.runScript<number[]>({
        script: SETTLE_QUOTA_COUNTERS_SCRIPT,
        keys: counters.map((counter) => counter.key),
        args: [JSON.stringify(counters.map((counter) => cost[counter.meter]))],
      });

      const remainings = counters.map((_, index) => {
        const existed = settleResults[2 * index] === 1;

        return existed ? settleResults[2 * index + 1] : null;
      });

      return this.findExhaustedScope({
        resourceType: args.resourceType,
        counters,
        remainings,
      });
    } catch (error) {
      return this.admitOnFailure({ error, workspaceId: args.workspaceId });
    }
  }

  private findExhaustedScope({
    resourceType,
    counters,
    remainings,
  }: {
    resourceType: UsageResourceType;
    counters: QuotaCounter[];
    remainings: (number | null)[];
  }): ExhaustedScope | null {
    const exhaustedIndex = remainings.findIndex(
      (remaining) => isDefined(remaining) && remaining <= 0,
    );

    if (exhaustedIndex === -1) {
      return null;
    }

    const counter = counters[exhaustedIndex];

    return {
      resourceType,
      limitKind: 'quota',
      spenderType: counter.spenderType,
      spenderId: counter.spenderId,
      operationType: counter.operationType,
      limitValue: counter.limitValue,
      remaining: 0,
      periodCount: 1,
      periodUnit: counter.periodUnit,
      retryAfterMs: Math.max(counter.periodEnd.getTime() - Date.now(), 0),
      isDefault: false,
    };
  }

  private async buildPoolExhaustedScope({
    workspaceId,
    resourceType,
  }: QuotaConsumeArgs): Promise<ExhaustedScope> {
    const [allowanceMicro, period] = await Promise.all([
      this.getAllowanceMicro(workspaceId),
      this.usagePeriodService.getCurrentPeriod({ workspaceId }),
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

  private admitOnFailure({
    error,
    workspaceId,
  }: {
    error: unknown;
    workspaceId: string;
  }): null {
    if (
      error instanceof WorkspaceCacheException ||
      error instanceof UsageLimitException
    ) {
      throw error;
    }

    this.logger.error(
      `Usage quota enforcement degraded for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
    );

    return null;
  }

  private async resolveCounters({
    workspaceId,
    resourceType,
    operationType,
    spenders,
  }: QuotaConsumeArgs): Promise<QuotaCounter[]> {
    const definition = findUsageLimitDefinition({
      resourceType,
      limitKind: 'quota',
    });

    if (!isDefined(definition)) {
      return [];
    }

    const quotaLimits = await this.findQuotaLimits({
      workspaceId,
      resourceType,
    });

    if (quotaLimits.length === 0) {
      return [];
    }

    const periodByUnit = await this.resolvePeriodsByUnit({
      workspaceId,
      quotaLimits,
    });

    const hasPercentLimit = quotaLimits.some(
      (limit) => limit.limitValueType === 'percent',
    );

    const allowanceMicro = hasPercentLimit
      ? await this.getAllowanceMicro(workspaceId)
      : null;

    return buildQuotaCounters({
      limits: quotaLimits,
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
    quotaLimits,
  }: {
    workspaceId: string;
    quotaLimits: FlatUsageLimit[];
  }): Promise<Partial<Record<PeriodUnit, UsagePeriod>>> {
    const periodUnits = [
      ...new Set(
        quotaLimits
          .map((limit) => limit.periodUnit)
          .filter(
            (periodUnit): periodUnit is AnchoredPeriodUnit =>
              periodUnit !== 'second',
          ),
      ),
    ];

    const periods = await Promise.all(
      periodUnits.map((periodUnit) =>
        this.usagePeriodService.getCurrentPeriod({ workspaceId, periodUnit }),
      ),
    );

    return Object.fromEntries(
      periodUnits.map((periodUnit, index) => [periodUnit, periods[index]]),
    );
  }

  private async findQuotaLimits({
    workspaceId,
    resourceType,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
  }): Promise<FlatUsageLimit[]> {
    const { usageLimits } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['usageLimits'],
    );

    return (usageLimits.byResourceType[resourceType] ?? []).filter(
      (limit) => limit.limitKind === 'quota',
    );
  }

  private async readRemainings({
    workspaceId,
    resourceType,
    counters,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
    counters: QuotaCounter[];
  }): Promise<(number | null)[]> {
    const remainings = await this.cacheStorage.mget<number>(
      counters.map((counter) => counter.key),
    );

    if (remainings.every(isDefined)) {
      return remainings as number[];
    }

    return this.warmColdCounters({ workspaceId, resourceType, counters });
  }

  private async warmColdCounters({
    workspaceId,
    resourceType,
    counters,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
    counters: QuotaCounter[];
  }): Promise<(number | null)[]> {
    return this.cacheLockService.withLock(
      async () => {
        const remainings = await this.cacheStorage.mget<number>(
          counters.map((counter) => counter.key),
        );

        if (remainings.every(isDefined)) {
          return remainings as number[];
        }

        const coldCounters = counters.filter(
          (_, index) => !isDefined(remainings[index]),
        );

        const rowsByPeriod = await this.fetchConsumptionRowsByPeriod({
          workspaceId,
          resourceType,
          coldCounters,
        });

        const now = Date.now();

        const warmedEntries = coldCounters.flatMap((counter) => {
          const ttl = counter.periodEnd.getTime() - now;
          const rows = rowsByPeriod.get(buildPeriodGroupKey(counter));

          if (ttl <= 0 || !isDefined(rows)) {
            return [];
          }

          return [
            {
              key: counter.key,
              value:
                counter.limitValue - computeQuotaConsumed({ rows, counter }),
              ttl,
            },
          ];
        });

        await this.cacheStorage.mset(warmedEntries);

        const warmedValueByKey = new Map(
          warmedEntries.map((entry) => [entry.key, entry.value]),
        );

        return counters.map(
          (counter, index) =>
            remainings[index] ?? warmedValueByKey.get(counter.key) ?? null,
        );
      },
      buildQuotaWarmLockKey(workspaceId),
      QUOTA_WARM_LOCK_OPTIONS,
    );
  }

  private async fetchConsumptionRowsByPeriod({
    workspaceId,
    resourceType,
    coldCounters,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
    coldCounters: QuotaCounter[];
  }): Promise<Map<string, QuotaConsumptionRow[]>> {
    const countersByPeriod = new Map<string, QuotaCounter>();

    for (const counter of coldCounters) {
      countersByPeriod.set(buildPeriodGroupKey(counter), counter);
    }

    const rowsByPeriod = new Map<string, QuotaConsumptionRow[]>();

    await Promise.all(
      [...countersByPeriod.entries()].map(async ([periodGroupKey, counter]) => {
        rowsByPeriod.set(
          periodGroupKey,
          await this.fetchConsumptionRows({
            workspaceId,
            resourceType,
            counter,
          }),
        );
      }),
    );

    return rowsByPeriod;
  }

  private async fetchConsumptionRows({
    workspaceId,
    resourceType,
    counter,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
    counter: QuotaCounter;
  }): Promise<QuotaConsumptionRow[]> {
    // Usage events only carry a periodStart stamp when a billing subscription
    // anchors the period; the calendar-month fallback must match by timestamp.
    const isBillingAnchored =
      counter.periodUnit === 'billingPeriod' &&
      (await this.hasBillingPeriodAnchor(workspaceId));

    const periodCondition = isBillingAnchored
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
        periodStart: formatDateTimeForClickHouse(counter.periodStart),
        periodEnd: formatDateTimeForClickHouse(counter.periodEnd),
      },
    );
  }

  private async hasBillingPeriodAnchor(workspaceId: string): Promise<boolean> {
    if (!this.billingService.isBillingEnabled()) {
      return false;
    }

    const { currentBillingSubscription } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'currentBillingSubscription',
      ]);

    return currentBillingSubscription !== NO_BILLING_SUBSCRIPTION;
  }

  private async getPoolAvailability(
    workspaceId: string,
  ): Promise<UsagePoolAvailability> {
    if (!this.billingService.isBillingEnabled()) {
      return 'unlimited';
    }

    const hasAvailableCredits =
      await this.billingUsageService.hasAvailableCredits(workspaceId);

    return hasAvailableCredits ? 'available' : 'exhausted';
  }

  private getAllowanceMicro(workspaceId: string): Promise<number | null> {
    return this.billingUsageService.getCurrentAllowanceMicro(workspaceId);
  }

  private async consumeCreditsMicro(
    workspaceId: string,
    costMicro: number,
  ): Promise<number | null> {
    if (!this.billingService.isBillingEnabled()) {
      return null;
    }

    return this.billingUsageService.decrementAvailableCreditsInCache({
      workspaceId,
      usedCredits: costMicro,
    });
  }
}

const buildPeriodGroupKey = (counter: QuotaCounter): string =>
  `${counter.periodUnit}:${counter.periodStart.getTime()}`;
