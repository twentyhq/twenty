import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  CacheLockException,
  CacheLockExceptionCode,
} from 'src/engine/core-modules/cache-lock/exceptions/cache-lock.exception';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { CONSUME_QUOTA_COUNTERS_SCRIPT } from 'src/engine/core-modules/usage-limit/constants/consume-quota-counters-script.constant';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { CreditAllowanceProvider } from 'src/engine/core-modules/usage-limit/interfaces/credit-allowance-provider.service';
import { UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { UsagePeriodService } from 'src/engine/core-modules/usage-limit/services/usage-period.service';
import { type AllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/allowance-quota-counter.type';
import { type AnchoredPeriodUnit } from 'src/engine/core-modules/usage-limit/types/anchored-period-unit.type';
import { type CreditAllowance } from 'src/engine/core-modules/usage-limit/types/credit-allowance.type';
import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type QuotaConsumptionRow } from 'src/engine/core-modules/usage-limit/types/quota-consumption-row.type';
import { type QuotaCost } from 'src/engine/core-modules/usage-limit/types/quota-cost.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { type UsageLimitCounterScope } from 'src/engine/core-modules/usage-limit/types/usage-limit-counter-scope.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';
import { buildAllowanceCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-allowance-counter-key.util';
import { buildAllowanceDerivedLimitCounterKeys } from 'src/engine/core-modules/usage-limit/utils/build-allowance-derived-limit-counter-keys.util';
import { buildIntraWorkspaceLimitCounterKeys } from 'src/engine/core-modules/usage-limit/utils/build-intra-workspace-limit-counter-keys.util';
import { buildLimitWarmedEntries } from 'src/engine/core-modules/usage-limit/utils/build-limit-warmed-entries.util';
import { buildPeriodGroupKey } from 'src/engine/core-modules/usage-limit/utils/build-period-group-key.util';
import { buildQuotaCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-counter-key.util';
import { buildQuotaCounters } from 'src/engine/core-modules/usage-limit/utils/build-quota-counters.util';
import { buildQuotaExhaustedScope } from 'src/engine/core-modules/usage-limit/utils/build-quota-exhausted-scope.util';
import { buildQuotaWarmLockKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-warm-lock-key.util';
import { clampQuotaCost } from 'src/engine/core-modules/usage-limit/utils/clamp-quota-cost.util';
import { findCreditAllowanceProvider } from 'src/engine/core-modules/usage-limit/utils/find-credit-allowance-provider.util';
import { findExhaustedCounters } from 'src/engine/core-modules/usage-limit/utils/find-exhausted-counters.util';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { fromConsumeResultsToRemainings } from 'src/engine/core-modules/usage-limit/utils/from-consume-results-to-remainings.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';
import { WorkspaceCacheException } from 'src/engine/workspace-cache/exceptions/workspace-cache.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const QUOTA_WARM_LOCK_OPTIONS = { ms: 50, maxRetries: 20, ttl: 10_000 };

type AllowanceSumRow = {
  total: string | number | null;
};

type QuotaConsumeArgs = {
  workspaceId: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenders: UsageSpenders;
};

@Injectable()
export class UsageLimitQuotaService implements OnModuleInit {
  private readonly logger = new Logger(UsageLimitQuotaService.name);

  private creditAllowanceProvider: CreditAllowanceProvider | null = null;

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineUsageLimit)
    private readonly cacheStorage: CacheStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly cacheLockService: CacheLockService,
    private readonly clickHouseService: ClickHouseService,
    private readonly usagePeriodService: UsagePeriodService,
    private readonly discoveryService: DiscoveryService,
    private readonly usageLimitEntitlementService: UsageLimitEntitlementService,
  ) {}

  onModuleInit() {
    this.creditAllowanceProvider = findCreditAllowanceProvider(
      this.discoveryService,
    );
  }

  async assertQuotaNotExhausted(args: QuotaConsumeArgs): Promise<void> {
    const exhaustedScopes =
      await this.findExhaustedScopesAdmittingOnFailure(args);

    const exhaustedScope =
      exhaustedScopes.find((scope) => scope.exhaustedKind === 'allowance') ??
      exhaustedScopes[0];

    if (isDefined(exhaustedScope)) {
      this.throwQuotaExhausted(exhaustedScope);
    }
  }

  async consumeQuota({
    cost,
    ...args
  }: QuotaConsumeArgs & { cost: QuotaCost }): Promise<{
    exhausted: ExhaustedScope[];
  }> {
    const clampedCost = clampQuotaCost(cost);

    if (
      clampedCost.creditsUsedMicro !== cost.creditsUsedMicro ||
      clampedCost.quantity !== cost.quantity
    ) {
      this.logger.error(
        `Refusing to consume invalid quota cost ${JSON.stringify(cost)} for workspace ${args.workspaceId}; treating it as 0`,
      );
    }

    return {
      exhausted: await this.consumeCountersAdmittingOnFailure({
        ...args,
        cost: clampedCost,
      }),
    };
  }

  async hasCreditAllowancePeriod(workspaceId: string): Promise<boolean> {
    return isDefined(
      await this.creditAllowanceProvider?.getCreditAllowancePeriod(workspaceId),
    );
  }

  async dropAllowanceCounter(workspaceId: string): Promise<void> {
    const period =
      await this.creditAllowanceProvider?.getCreditAllowancePeriod(workspaceId);

    if (!isDefined(period)) {
      return;
    }

    const allowanceDerivedLimitKeys = buildAllowanceDerivedLimitCounterKeys({
      workspaceId,
      limits: await this.findAllLimits(workspaceId),
      periodStart: period.periodStart,
    });

    await this.delUnderWarmLock({
      workspaceId,
      keys: [
        buildAllowanceCounterKey({
          workspaceId,
          periodStart: period.periodStart,
        }),
        ...allowanceDerivedLimitKeys,
      ],
    });
  }

  async dropIntraWorkspaceLimitCounters(workspaceId: string): Promise<void> {
    const limits = await this.findAllLimits(workspaceId);

    const keys = buildIntraWorkspaceLimitCounterKeys({
      workspaceId,
      limits,
      periodByUnit: await this.findCurrentPeriodsByUnit({
        workspaceId,
        quotaLimits: limits.filter((limit) => limit.limitKind === 'quota'),
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

    const period = await this.findCurrentPeriod({
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

  private async findExhaustedScopesAdmittingOnFailure(
    args: QuotaConsumeArgs,
  ): Promise<ExhaustedScope[]> {
    try {
      const counters = await this.buildCounters(args);

      if (counters.length === 0) {
        return [];
      }

      const remainings = await this.readRemainings({
        workspaceId: args.workspaceId,
        counters,
      });

      return await this.buildExhaustedScopes({
        args,
        counters,
        remainings,
      });
    } catch (error) {
      return this.admitOnFailure({
        error,
        workspaceId: args.workspaceId,
        admitted: [],
      });
    }
  }

  private async consumeCountersAdmittingOnFailure({
    cost,
    ...args
  }: QuotaConsumeArgs & { cost: QuotaCost }): Promise<ExhaustedScope[]> {
    try {
      const counters = await this.buildCounters(args);

      if (counters.length === 0) {
        return [];
      }

      // The consume script only debits keys that exist: warm cold counters
      // first so a consume-only caller (workflow, logic function) is metered
      // from its first call instead of waiting for an assert to warm the key.
      await this.readRemainings({ workspaceId: args.workspaceId, counters });

      const consumeResults = await this.cacheStorage.runScript<number[]>({
        script: CONSUME_QUOTA_COUNTERS_SCRIPT,
        keys: counters.map((counter) => counter.key),
        args: [JSON.stringify(counters.map((counter) => cost[counter.meter]))],
      });

      const remainings = fromConsumeResultsToRemainings(consumeResults);

      return await this.buildExhaustedScopes({
        args,
        counters,
        remainings,
      });
    } catch (error) {
      return this.admitOnFailure({
        error,
        workspaceId: args.workspaceId,
        admitted: [],
      });
    }
  }

  private async buildExhaustedScopes({
    args,
    counters,
    remainings,
  }: {
    args: QuotaConsumeArgs;
    counters: QuotaCounter[];
    remainings: (number | null)[];
  }): Promise<ExhaustedScope[]> {
    const exhaustedCounters = findExhaustedCounters({ counters, remainings });

    if (exhaustedCounters.length === 0) {
      return [];
    }

    const allowance = exhaustedCounters.some(
      (counter) => counter.kind === 'allowance',
    )
      ? ((await this.creditAllowanceProvider?.getCreditAllowance(
          args.workspaceId,
        )) ?? null)
      : null;

    return exhaustedCounters.map((counter) =>
      buildQuotaExhaustedScope({
        resourceType: args.resourceType,
        counter,
        allowance,
      }),
    );
  }

  private throwQuotaExhausted(exhaustedScope: ExhaustedScope): never {
    if (exhaustedScope.exhaustedKind === 'allowance') {
      throw new UsageLimitException(
        'Credit allowance exhausted for this billing period',
        UsageLimitExceptionCode.QUOTA_EXHAUSTED,
        {
          userFriendlyMessage: msg`Credit allowance exhausted for this billing period.`,
          exhaustedScope,
        },
      );
    }

    throw new UsageLimitException(
      `Usage limit reached for ${exhaustedScope.spenderType}`,
      UsageLimitExceptionCode.QUOTA_EXHAUSTED,
      { exhaustedScope },
    );
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
    if (
      error instanceof WorkspaceCacheException ||
      error instanceof UsageLimitException
    ) {
      throw error;
    }

    this.logger.error(
      `Usage quota enforcement degraded for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
    );

    return admitted;
  }

  private async buildCounters(args: QuotaConsumeArgs): Promise<QuotaCounter[]> {
    const [limitCounters, allowanceCounter] = await Promise.all([
      this.buildLimitCounters(args),
      this.buildAllowanceCounter(args.workspaceId),
    ]);

    return isDefined(allowanceCounter)
      ? [...limitCounters, allowanceCounter]
      : limitCounters;
  }

  private async buildLimitCounters({
    workspaceId,
    resourceType,
    operationType,
    spenders,
  }: QuotaConsumeArgs): Promise<LimitQuotaCounter[]> {
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
      resourceType,
      operationType,
      periodByUnit: await this.findCurrentPeriodsByUnit({
        workspaceId,
        quotaLimits,
      }),
    });
  }

  private async buildAllowanceCounter(
    workspaceId: string,
  ): Promise<AllowanceQuotaCounter | null> {
    const creditAllowanceProvider = this.creditAllowanceProvider;

    if (
      !isDefined(creditAllowanceProvider) ||
      !(await creditAllowanceProvider.isCreditAllowanceEnabled(workspaceId))
    ) {
      return null;
    }

    const period =
      await creditAllowanceProvider.getCreditAllowancePeriod(workspaceId);

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

  private async findCurrentPeriodsByUnit({
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
      periodUnits.map(async (periodUnit) => ({
        periodUnit,
        period: await this.findCurrentPeriod({ workspaceId, periodUnit }),
      })),
    );

    return Object.fromEntries(
      periods
        .filter(({ period }) => isDefined(period))
        .map(({ periodUnit, period }) => [periodUnit, period]),
    );
  }

  private async findCurrentPeriod({
    workspaceId,
    periodUnit,
  }: {
    workspaceId: string;
    periodUnit: AnchoredPeriodUnit;
  }): Promise<UsagePeriod | null> {
    if (periodUnit === 'allowancePeriod') {
      return (
        (await this.creditAllowanceProvider?.getCreditAllowancePeriod(
          workspaceId,
        )) ?? null
      );
    }

    return this.usagePeriodService.getCurrentPeriod(periodUnit);
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

  private async readRemainings({
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

    const isAllowanceNeeded =
      isDefined(coldAllowanceCounter) ||
      coldLimitCounters.some(
        (counter) => counter.limitValueType === 'allowancePercent',
      );

    const [rowsByPeriod, allowance] = await Promise.all([
      this.fetchConsumptionRowsByPeriod({
        workspaceId,
        coldLimitCounters,
      }),
      isAllowanceNeeded
        ? this.creditAllowanceProvider?.getCreditAllowance(workspaceId)
        : null,
    ]);

    return [
      ...buildLimitWarmedEntries({
        coldLimitCounters,
        rowsByPeriod,
        allowance: allowance ?? null,
        now,
      }),
      ...(await this.buildAllowanceWarmedEntry({
        workspaceId,
        counter: coldAllowanceCounter,
        allowance: allowance ?? null,
        now,
      })),
    ];
  }

  private async buildAllowanceWarmedEntry({
    workspaceId,
    counter,
    allowance,
    now,
  }: {
    workspaceId: string;
    counter: AllowanceQuotaCounter | undefined;
    allowance: CreditAllowance | null;
    now: number;
  }): Promise<{ key: string; value: number; ttl: number }[]> {
    if (!isDefined(counter)) {
      return [];
    }

    const ttl = counter.periodEnd.getTime() - now;

    if (ttl <= 0) {
      return [];
    }

    if (
      !isDefined(allowance) ||
      allowance.periodStart.getTime() !== counter.periodStart.getTime()
    ) {
      return [];
    }

    const consumedMicro = await this.fetchAllowanceConsumedMicro({
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

  private async fetchAllowanceConsumedMicro({
    workspaceId,
    periodStart,
  }: {
    workspaceId: string;
    periodStart: Date;
  }): Promise<number> {
    const rows = await this.clickHouseService.selectOrThrow<AllowanceSumRow>(
      `SELECT sum(creditsUsedMicro) AS total
       FROM usageEvent
       WHERE workspaceId = {workspaceId:String}
         AND periodStart = {periodStart:DateTime64(3)}`,
      {
        workspaceId,
        periodStart: formatDateTimeForClickHouse(periodStart),
      },
    );

    return Number(rows[0]?.total ?? 0);
  }

  private async fetchConsumptionRowsByPeriod({
    workspaceId,
    coldLimitCounters,
  }: {
    workspaceId: string;
    coldLimitCounters: LimitQuotaCounter[];
  }): Promise<Map<string, QuotaConsumptionRow[]>> {
    const countersByPeriod = new Map<string, LimitQuotaCounter>();

    for (const counter of coldLimitCounters) {
      countersByPeriod.set(buildPeriodGroupKey(counter), counter);
    }

    const rowsByPeriod = new Map<string, QuotaConsumptionRow[]>();

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

  private async fetchConsumptionRows({
    workspaceId,
    counter,
  }: {
    workspaceId: string;
    counter: LimitQuotaCounter;
  }): Promise<QuotaConsumptionRow[]> {
    const periodClause =
      counter.periodUnit === 'allowancePeriod'
        ? 'AND periodStart = {periodStart:DateTime64(3)}'
        : `AND toStartOfDay(timestamp, 'UTC') >= {periodStart:DateTime64(3)}
         AND toStartOfDay(timestamp, 'UTC') < {periodEnd:DateTime64(3)}`;

    return this.clickHouseService.selectOrThrow<QuotaConsumptionRow>(
      `SELECT operationType, userWorkspaceId, apiKeyId, applicationId, agentId,
              workflowId, logicFunctionId,
              sum(creditsUsedMicro) AS creditsUsedMicro,
              sum(quantity) AS quantity
       FROM usageEvent
       WHERE workspaceId = {workspaceId:String}
         AND resourceType = {resourceType:String}
         ${periodClause}
       GROUP BY operationType, userWorkspaceId, apiKeyId, applicationId, agentId,
                workflowId, logicFunctionId`,
      {
        workspaceId,
        resourceType: counter.resourceType,
        periodStart: formatDateTimeForClickHouse(counter.periodStart),
        periodEnd: formatDateTimeForClickHouse(counter.periodEnd),
      },
    );
  }
}
