import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { isDefined } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  CacheLockException,
  CacheLockExceptionCode,
} from 'src/engine/core-modules/cache-lock/exceptions/cache-lock.exception';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { CONSUME_QUOTA_COUNTERS_SCRIPT } from 'src/engine/core-modules/usage-limit/constants/consume-quota-counters-script.constant';
import { CreditAllowanceProvider } from 'src/engine/core-modules/usage-limit/interfaces/credit-allowance-provider.service';
import { UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { UsagePeriodService } from 'src/engine/core-modules/usage-limit/services/usage-period.service';
import { type AllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/allowance-quota-counter.type';
import { type CreditAllowance } from 'src/engine/core-modules/usage-limit/types/credit-allowance.type';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type LimitConsumption } from 'src/engine/core-modules/usage-limit/types/limit-consumption.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type QuotaCost } from 'src/engine/core-modules/usage-limit/types/quota-cost.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { type QuotaCounterScope } from 'src/engine/core-modules/usage-limit/types/quota-counter-scope.type';
import { type UsageLimitCounterScope } from 'src/engine/core-modules/usage-limit/types/usage-limit-counter-scope.type';
import { buildAllowanceCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-allowance-counter-key.util';
import { buildIntraWorkspaceLimitCounterKeys } from 'src/engine/core-modules/usage-limit/utils/build-intra-workspace-limit-counter-keys.util';
import { buildLimitQuotaCounter } from 'src/engine/core-modules/usage-limit/utils/build-limit-quota-counter.util';
import { buildLimitWarmedEntries } from 'src/engine/core-modules/usage-limit/utils/build-limit-warmed-entries.util';
import { buildPeriodGroupKey } from 'src/engine/core-modules/usage-limit/utils/build-period-group-key.util';
import { buildQuotaCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-counter-key.util';
import { buildQuotaCounters } from 'src/engine/core-modules/usage-limit/utils/build-quota-counters.util';
import { buildQuotaWarmLockKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-warm-lock-key.util';
import { computeQuotaConsumed } from 'src/engine/core-modules/usage-limit/utils/compute-quota-consumed.util';
import { findCreditAllowanceProvider } from 'src/engine/core-modules/usage-limit/utils/find-credit-allowance-provider.util';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { fromConsumeResultsToRemainings } from 'src/engine/core-modules/usage-limit/utils/from-consume-results-to-remainings.util';
import { getPeriodAnchor } from 'src/engine/core-modules/usage-limit/utils/get-period-anchor.util';
import { isAdmittableQuotaFailure } from 'src/engine/core-modules/usage-limit/utils/is-admittable-quota-failure.util';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageAnalyticsService } from 'src/engine/core-modules/usage/services/usage-analytics.service';
import { type UsageConsumptionRow } from 'src/engine/core-modules/usage/types/usage-consumption-row.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const QUOTA_WARM_LOCK_OPTIONS = { ms: 50, maxRetries: 20, ttl: 10_000 };

@Injectable()
export class UsageQuotaCounterService implements OnModuleInit {
  private readonly logger = new Logger(UsageQuotaCounterService.name);

  private creditAllowanceProvider: CreditAllowanceProvider;

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineUsageLimit)
    private readonly cacheStorage: CacheStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly cacheLockService: CacheLockService,
    private readonly usagePeriodService: UsagePeriodService,
    private readonly usageAnalyticsService: UsageAnalyticsService,
    private readonly discoveryService: DiscoveryService,
    private readonly usageLimitEntitlementService: UsageLimitEntitlementService,
  ) {}

  onModuleInit() {
    this.creditAllowanceProvider = findCreditAllowanceProvider(
      this.discoveryService,
    );
  }

  async buildCounters(scope: QuotaCounterScope): Promise<QuotaCounter[]> {
    const [limitCounters, allowanceCounter] = await Promise.all([
      this.buildLimitCounters(scope),
      this.buildAllowanceCounter(scope.workspaceId),
    ]);

    return isDefined(allowanceCounter)
      ? [...limitCounters, allowanceCounter]
      : limitCounters;
  }

  async readRemainings({
    workspaceId,
    counters,
  }: {
    workspaceId: string;
    counters: QuotaCounter[];
  }): Promise<(number | null)[]> {
    const remainings = await this.cacheStorage.mget<number>(
      counters.map((counter) => counter.key),
    );

    const warmRemainings = remainings.filter(isDefined);

    if (warmRemainings.length === remainings.length) {
      return warmRemainings;
    }

    return this.warmColdCounters({ workspaceId, counters });
  }

  async consumeCounters({
    workspaceId,
    counters,
    cost,
  }: {
    workspaceId: string;
    counters: QuotaCounter[];
    cost: QuotaCost;
  }): Promise<(number | null)[]> {
    // The consume script only debits keys that exist: warm cold counters
    // first so a consume-only caller (workflow, logic function) is metered
    // from its first call instead of waiting for an assert to warm the key.
    await this.readRemainings({ workspaceId, counters });

    const consumeResults = await this.cacheStorage.runScript<number[]>({
      script: CONSUME_QUOTA_COUNTERS_SCRIPT,
      keys: counters.map((counter) => counter.key),
      args: [JSON.stringify(counters.map((counter) => cost[counter.meter]))],
    });

    return fromConsumeResultsToRemainings(consumeResults);
  }

  async readLimitConsumptions({
    workspaceId,
    limits,
  }: {
    workspaceId: string;
    limits: FlatUsageLimit[];
  }): Promise<Map<string, LimitConsumption>> {
    if (limits.length === 0) {
      return new Map();
    }

    const periodByUnit = await this.usagePeriodService.findCurrentPeriodsByUnit(
      { workspaceId, limits },
    );

    const entries = limits.flatMap((limit) => {
      const period = periodByUnit[limit.periodUnit];

      return isDefined(period)
        ? [
            {
              limit,
              counter: buildLimitQuotaCounter({ workspaceId, limit, period }),
            },
          ]
        : [];
    });

    if (entries.length === 0) {
      return new Map();
    }

    const consumedValues = await this.readConsumedValuesAdmittingOnFailure({
      workspaceId,
      counters: entries.map(({ counter }) => counter),
    });

    return new Map(
      entries.map(({ limit, counter }, index) => {
        const consumedValue = consumedValues[index] ?? null;

        return [
          limit.id,
          {
            consumedValue,
            remainingValue: isDefined(consumedValue)
              ? limit.limitValue - consumedValue
              : null,
            periodStart: counter.periodStart,
            periodEnd: counter.periodEnd,
          },
        ] as const;
      }),
    );
  }

  async getAllowanceRemainingMicro(
    workspaceId: string,
  ): Promise<number | null> {
    try {
      const allowanceCounter = await this.buildAllowanceCounter(workspaceId);

      if (!isDefined(allowanceCounter)) {
        return null;
      }

      const [remaining] = await this.readRemainings({
        workspaceId,
        counters: [allowanceCounter],
      });

      return remaining;
    } catch (error) {
      return this.admitOnFailure({ error, workspaceId, admitted: null });
    }
  }

  getCreditAllowance(workspaceId: string): Promise<CreditAllowance | null> {
    return this.creditAllowanceProvider.getCreditAllowance(workspaceId);
  }

  async dropAllowanceCounter(workspaceId: string): Promise<void> {
    const period =
      await this.creditAllowanceProvider.getCreditAllowancePeriod(workspaceId);

    if (!isDefined(period)) {
      return;
    }

    await this.delUnderWarmLock({
      workspaceId,
      keys: [
        buildAllowanceCounterKey({
          workspaceId,
          periodStart: period.periodStart,
        }),
      ],
    });
  }

  // Intra-workspace counters are not debited while the entitlement is off, so
  // a warm balance misses that usage; dropping them forces a ClickHouse rewarm.
  async dropIntraWorkspaceLimitCounters(workspaceId: string): Promise<void> {
    const limits = await this.findAllLimits(workspaceId);

    const keys = buildIntraWorkspaceLimitCounterKeys({
      workspaceId,
      limits,
      periodByUnit: await this.usagePeriodService.findCurrentPeriodsByUnit({
        workspaceId,
        limits,
      }),
    });

    if (keys.length === 0) {
      return;
    }

    await this.delUnderWarmLock({ workspaceId, keys });
  }

  async dropLimitCounter(usageLimit: UsageLimitCounterScope): Promise<void> {
    if (
      usageLimit.limitKind !== 'quota' ||
      usageLimit.periodUnit === 'second'
    ) {
      return;
    }

    const period = await this.usagePeriodService.findCurrentPeriod({
      workspaceId: usageLimit.workspaceId,
      periodUnit: usageLimit.periodUnit,
    });

    if (!isDefined(period)) {
      return;
    }

    await this.delUnderWarmLock({
      workspaceId: usageLimit.workspaceId,
      keys: [
        buildQuotaCounterKey({
          workspaceId: usageLimit.workspaceId,
          resourceType: usageLimit.resourceType,
          operationType: usageLimit.operationType,
          spenderType: usageLimit.spenderType,
          spenderId: usageLimit.spenderId,
          meter: usageLimit.meter,
          periodUnit: usageLimit.periodUnit,
          periodStart: period.periodStart,
        }),
      ],
    });
  }

  private async delUnderWarmLock({
    workspaceId,
    keys,
  }: {
    workspaceId: string;
    keys: string[];
  }): Promise<void> {
    try {
      await this.cacheLockService.withLock(
        () => this.cacheStorage.mdel(keys),
        buildQuotaWarmLockKey(workspaceId),
        QUOTA_WARM_LOCK_OPTIONS,
      );
    } catch (error) {
      if (
        !(error instanceof CacheLockException) ||
        error.code !== CacheLockExceptionCode.LOCK_ACQUISITION_TIMEOUT
      ) {
        throw error;
      }

      this.logger.warn(
        `Dropping quota counters ${keys.join(', ')} without the warm lock: ${error.message}`,
      );

      await this.cacheStorage.mdel(keys);
    }
  }

  private async findAllLimits(workspaceId: string): Promise<FlatUsageLimit[]> {
    const { usageLimits } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['usageLimits'],
    );

    return Object.values(usageLimits.byResourceType).flatMap(
      (limits) => limits ?? [],
    );
  }

  private async buildLimitCounters({
    workspaceId,
    resourceType,
    operationType,
    spenders,
  }: QuotaCounterScope): Promise<LimitQuotaCounter[]> {
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

    return buildQuotaCounters({
      limits: quotaLimits,
      usageSpenders: spenders,
      workspaceId,
      operationType,
      periodByUnit: await this.usagePeriodService.findCurrentPeriodsByUnit({
        workspaceId,
        limits: quotaLimits,
      }),
    });
  }

  private async buildAllowanceCounter(
    workspaceId: string,
  ): Promise<AllowanceQuotaCounter | null> {
    if (
      !(await this.creditAllowanceProvider.isCreditAllowanceEnabled(
        workspaceId,
      ))
    ) {
      return null;
    }

    const period = await this.usagePeriodService.findCurrentPeriod({
      workspaceId,
      periodUnit: 'allowancePeriod',
    });

    if (!isDefined(period)) {
      return null;
    }

    return {
      kind: 'allowance',
      key: buildAllowanceCounterKey({
        workspaceId,
        periodStart: period.periodStart,
      }),
      meter: 'creditsUsedMicro',
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
    };
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

    const quotaLimits = (usageLimits.byResourceType[resourceType] ?? []).filter(
      (limit) => limit.limitKind === 'quota',
    );

    return this.usageLimitEntitlementService.findEnforceableLimits({
      workspaceId,
      limits: quotaLimits,
    });
  }

  private async readConsumedValuesAdmittingOnFailure({
    workspaceId,
    counters,
  }: {
    workspaceId: string;
    counters: LimitQuotaCounter[];
  }): Promise<(number | null)[]> {
    try {
      return await this.readConsumedValues({ workspaceId, counters });
    } catch (error) {
      return this.admitOnFailure<(number | null)[]>({
        error,
        workspaceId,
        admitted: [],
      });
    }
  }

  private async readConsumedValues({
    workspaceId,
    counters,
  }: {
    workspaceId: string;
    counters: LimitQuotaCounter[];
  }): Promise<(number | null)[]> {
    const remainings = await this.cacheStorage.mget<number>(
      counters.map((counter) => counter.key),
    );

    const coldLimitCounters = counters.filter(
      (_, index) => !isDefined(remainings[index]),
    );

    const rowsByPeriod =
      coldLimitCounters.length > 0
        ? await this.fetchConsumptionRowsByPeriod({
            workspaceId,
            coldLimitCounters,
          })
        : new Map<string, UsageConsumptionRow[]>();

    return counters.map((counter, index) => {
      const remaining = remainings[index];

      if (isDefined(remaining)) {
        return counter.limitValue - remaining;
      }

      const rows = rowsByPeriod.get(buildPeriodGroupKey(counter));

      return isDefined(rows)
        ? computeQuotaConsumed({ rows, scope: counter })
        : null;
    });
  }

  private async warmColdCounters({
    workspaceId,
    counters,
  }: {
    workspaceId: string;
    counters: QuotaCounter[];
  }): Promise<(number | null)[]> {
    return this.cacheLockService.withLock(
      async () => {
        const remainings = await this.cacheStorage.mget<number>(
          counters.map((counter) => counter.key),
        );

        const warmRemainings = remainings.filter(isDefined);

        if (warmRemainings.length === remainings.length) {
          return warmRemainings;
        }

        const coldCounters = counters.filter(
          (_, index) => !isDefined(remainings[index]),
        );

        const warmedEntries = await this.buildWarmedEntries({
          workspaceId,
          coldCounters,
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

  private async buildWarmedEntries({
    workspaceId,
    coldCounters,
  }: {
    workspaceId: string;
    coldCounters: QuotaCounter[];
  }): Promise<{ key: string; value: number; ttl: number }[]> {
    const coldLimitCounters = coldCounters.filter(
      (counter): counter is LimitQuotaCounter => counter.kind === 'limit',
    );
    const coldAllowanceCounter = coldCounters.find(
      (counter): counter is AllowanceQuotaCounter =>
        counter.kind === 'allowance',
    );

    const now = Date.now();

    const [rowsByPeriod, allowanceEntries] = await Promise.all([
      this.fetchConsumptionRowsByPeriod({
        workspaceId,
        coldLimitCounters,
      }),
      this.buildAllowanceWarmedEntry({
        workspaceId,
        counter: coldAllowanceCounter,
        now,
      }),
    ]);

    return [
      ...buildLimitWarmedEntries({ coldLimitCounters, rowsByPeriod, now }),
      ...allowanceEntries,
    ];
  }

  private async buildAllowanceWarmedEntry({
    workspaceId,
    counter,
    now,
  }: {
    workspaceId: string;
    counter: AllowanceQuotaCounter | undefined;
    now: number;
  }): Promise<{ key: string; value: number; ttl: number }[]> {
    if (!isDefined(counter)) {
      return [];
    }

    const ttl = counter.periodEnd.getTime() - now;

    if (ttl <= 0) {
      return [];
    }

    const allowance =
      await this.creditAllowanceProvider.getCreditAllowance(workspaceId);

    if (
      !isDefined(allowance) ||
      allowance.periodStart.getTime() !== counter.periodStart.getTime()
    ) {
      return [];
    }

    const consumedMicro =
      await this.usageAnalyticsService.getCreditsUsedMicroForBillingPeriod({
        workspaceId,
        periodStart: counter.periodStart,
      });

    return [
      {
        key: counter.key,
        value: allowance.allowanceMicro - consumedMicro,
        ttl,
      },
    ];
  }

  private async fetchConsumptionRowsByPeriod({
    workspaceId,
    coldLimitCounters,
  }: {
    workspaceId: string;
    coldLimitCounters: LimitQuotaCounter[];
  }): Promise<Map<string, UsageConsumptionRow[]>> {
    const countersByPeriod = new Map<string, LimitQuotaCounter>();

    for (const counter of coldLimitCounters) {
      countersByPeriod.set(buildPeriodGroupKey(counter), counter);
    }

    const rowsByPeriod = new Map<string, UsageConsumptionRow[]>();

    await Promise.all(
      [...countersByPeriod.entries()].map(async ([periodGroupKey, counter]) => {
        rowsByPeriod.set(
          periodGroupKey,
          await this.fetchConsumptionRows({ workspaceId, counter }),
        );
      }),
    );

    return rowsByPeriod;
  }

  private fetchConsumptionRows({
    workspaceId,
    counter,
  }: {
    workspaceId: string;
    counter: LimitQuotaCounter;
  }): Promise<UsageConsumptionRow[]> {
    return this.usageAnalyticsService.getConsumptionRowsForAllScopes({
      workspaceId,
      resourceType: counter.resourceType,
      periodStart: counter.periodStart,
      periodEnd: counter.periodEnd,
      periodAnchor: getPeriodAnchor(counter.periodUnit),
    });
  }

  private admitOnFailure<TAdmitted>({
    error,
    workspaceId,
    admitted,
  }: {
    error: unknown;
    workspaceId: string;
    admitted: TAdmitted;
  }): TAdmitted {
    if (!isAdmittableQuotaFailure(error)) {
      throw error;
    }

    this.logger.error(
      `Reading usage quota counters failed for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
    );

    return admitted;
  }
}
