import { Injectable, Logger } from '@nestjs/common';

import uniqBy from 'lodash.uniqby';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { BillingCreditAllowanceService } from 'src/engine/core-modules/billing/services/billing-credit-allowance.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WARM_AND_CONSUME_COUNTERS_SCRIPT } from 'src/engine/core-modules/usage-limit/constants/warm-and-consume-counters-script.constant';
import { UsageLimitException } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageLimitDefaultValueService } from 'src/engine/core-modules/usage-limit/services/usage-limit-default-value.service';
import { UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { UsagePeriodService } from 'src/engine/core-modules/usage-limit/services/usage-period.service';
import { type AllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/allowance-quota-counter.type';
import { type ExhaustedKind } from 'src/engine/core-modules/usage-limit/types/exhausted-kind.type';
import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { type FlatQuotaLimit } from 'src/engine/core-modules/usage-limit/types/flat-quota-limit.type';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type LimitConsumption } from 'src/engine/core-modules/usage-limit/types/limit-consumption.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type QuotaCost } from 'src/engine/core-modules/usage-limit/types/quota-cost.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { type QuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/quota-limit-default.type';
import { buildAllowanceCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-allowance-counter-key.util';
import { buildConsumeScriptArguments } from 'src/engine/core-modules/usage-limit/utils/build-consume-script-arguments.util';
import { buildIntraWorkspaceLimitCounterKeys } from 'src/engine/core-modules/usage-limit/utils/build-intra-workspace-limit-counter-keys.util';
import { buildLimitQuotaCounter } from 'src/engine/core-modules/usage-limit/utils/build-limit-quota-counter.util';
import { buildPeriodGroupKey } from 'src/engine/core-modules/usage-limit/utils/build-period-group-key.util';
import { buildQuotaCounters } from 'src/engine/core-modules/usage-limit/utils/build-quota-counters.util';
import { buildQuotaDebits } from 'src/engine/core-modules/usage-limit/utils/build-quota-debits.util';
import { buildQuotaExhaustedScope } from 'src/engine/core-modules/usage-limit/utils/build-quota-exhausted-scope.util';
import { buildSpendersFromUsageSpenders } from 'src/engine/core-modules/usage-limit/utils/build-spenders-from-usage-spenders.util';
import { computeCreditAllowanceMicro } from 'src/engine/core-modules/usage-limit/utils/compute-credit-allowance-micro.util';
import { computeQuotaConsumed } from 'src/engine/core-modules/usage-limit/utils/compute-quota-consumed.util';
import { findExhaustedCounters } from 'src/engine/core-modules/usage-limit/utils/find-exhausted-counters.util';
import { findLimitsForResource } from 'src/engine/core-modules/usage-limit/utils/find-limits-for-resource.util';
import { findSuppressedUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/utils/find-suppressed-usage-limit-defaults.util';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { isQuotaLimit } from 'src/engine/core-modules/usage-limit/utils/is-quota-limit.util';
import { getPeriodAnchor } from 'src/engine/core-modules/usage-limit/utils/get-period-anchor.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { UsageAnalyticsService } from 'src/engine/core-modules/usage/services/usage-analytics.service';
import { UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { type UsageConsumptionRow } from 'src/engine/core-modules/usage/types/usage-consumption-row.type';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';
import { fromRecordUsageInputToUsageConsumptionRow } from 'src/engine/core-modules/usage/utils/from-record-usage-input-to-usage-consumption-row.util';
import { WorkspaceCacheException } from 'src/engine/workspace-cache/exceptions/workspace-cache.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type QuotaEnforcement = {
  operation: 'assert' | 'consume';
  resourceType: UsageResourceType;
  creditsUsedMicro?: number;
};

type QuotaConsumeArgs = {
  workspaceId: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenders: UsageSpenders;
};

type QuotaConsumeResult = {
  consumedValues: (number | null)[];
  isDegraded: boolean;
};

@Injectable()
export class UsageLimitQuotaService {
  private readonly logger = new Logger(UsageLimitQuotaService.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineUsageLimit)
    private readonly cacheStorage: CacheStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly usagePeriodService: UsagePeriodService,
    private readonly usageAnalyticsService: UsageAnalyticsService,
    private readonly usageRecorderService: UsageRecorderService,
    private readonly billingCreditAllowanceService: BillingCreditAllowanceService,
    private readonly usageLimitEntitlementService: UsageLimitEntitlementService,
    private readonly usageLimitDefaultValueService: UsageLimitDefaultValueService,
    private readonly metricsService: MetricsService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async findExhaustedScope(
    args: QuotaConsumeArgs & { cost?: QuotaCost },
  ): Promise<ExhaustedScope | null> {
    const exhaustedScopes =
      await this.findExhaustedScopesAdmittingOnFailure(args);

    return (
      exhaustedScopes.find((scope) => scope.exhaustedKind === 'allowance') ??
      exhaustedScopes[0] ??
      null
    );
  }

  async charge({
    workspaceId,
    events,
  }: {
    workspaceId: string;
    events: RecordUsageInput[];
  }): Promise<{ exhaustedKind: ExhaustedKind | null }> {
    if (events.length === 0) {
      return { exhaustedKind: null };
    }

    const exhaustedKind = await this.debitCountersAdmittingOnFailure({
      workspaceId,
      events,
    });

    await this.usageRecorderService.record(workspaceId, events);

    return { exhaustedKind };
  }

  async debitAheadOfRecord({
    workspaceId,
    event,
  }: {
    workspaceId: string;
    event: RecordUsageInput;
  }): Promise<{ exhaustedKind: ExhaustedKind | null }> {
    return {
      exhaustedKind: await this.debitCountersAdmittingOnFailure({
        workspaceId,
        events: [event],
      }),
    };
  }

  async dropIntraWorkspaceLimitCounters(workspaceId: string): Promise<void> {
    const limits = await this.findAllLimits(workspaceId);

    const keys = buildIntraWorkspaceLimitCounterKeys({
      workspaceId,
      limits,
      periodByUnit: await this.usagePeriodService.findCurrentPeriodsByUnit({
        workspaceId,
        periodUnits: limits.map((limit) => limit.periodUnit),
      }),
    });

    if (keys.length === 0) {
      return;
    }

    await this.cacheStorage.mdel(keys);
  }

  async dropLimitCounter({
    workspaceId,
    usageLimit,
  }: {
    workspaceId: string;
    usageLimit: FlatUsageLimit;
  }): Promise<void> {
    if (
      !isQuotaLimit(usageLimit) ||
      isNonEmptyArray(findSuppressedUsageLimitDefaults(usageLimit))
    ) {
      return;
    }

    const periodByUnit = await this.usagePeriodService.findCurrentPeriodsByUnit(
      {
        workspaceId,
        periodUnits: [usageLimit.periodUnit],
      },
    );

    const period = periodByUnit[usageLimit.periodUnit];

    if (!isDefined(period)) {
      return;
    }

    await this.cacheStorage.del(
      buildLimitQuotaCounter({ workspaceId, limit: usageLimit, period }).key,
    );
  }

  async getAllowanceUsage(workspaceId: string): Promise<{
    limitValue: number;
    consumedValue: number | null;
    periodEnd: Date;
  } | null> {
    const counter = await this.buildAllowanceCounter(workspaceId);

    if (!isDefined(counter)) {
      return null;
    }

    let consumedValue: number | null = null;

    try {
      const [storedValue] = await this.cacheStorage.mget<number>([counter.key]);

      consumedValue =
        storedValue ??
        (await this.usageAnalyticsService.getCreditsUsedMicroForBillingPeriod({
          workspaceId,
          periodStart: counter.periodStart,
        }));
    } catch (error) {
      this.admitOnFailure({ error, workspaceId, admitted: null });
    }

    return {
      limitValue: counter.limitValue,
      consumedValue,
      periodEnd: counter.periodEnd,
    };
  }

  async getAllowanceRemainingMicro(
    workspaceId: string,
  ): Promise<number | null> {
    try {
      const counter = await this.buildAllowanceCounter(workspaceId);

      if (!isDefined(counter)) {
        return null;
      }

      const {
        consumedValues: [consumedValue],
      } = await this.consumeCounters({
        workspaceId,
        counters: [counter],
        amounts: [0],
      });

      return isDefined(consumedValue)
        ? counter.limitValue - consumedValue
        : null;
    } catch (error) {
      return this.admitOnFailure({ error, workspaceId, admitted: null });
    }
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
      { workspaceId, periodUnits: limits.map((limit) => limit.periodUnit) },
    );

    const entries = limits.filter(isQuotaLimit).flatMap((limit) => {
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

  private async findAllLimits(workspaceId: string): Promise<FlatUsageLimit[]> {
    const { usageLimits } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['usageLimits'],
    );

    return Object.values(usageLimits.byResourceType).flatMap(
      (limits) => limits ?? [],
    );
  }

  private async findExhaustedScopesAdmittingOnFailure({
    cost,
    ...args
  }: QuotaConsumeArgs & { cost?: QuotaCost }): Promise<ExhaustedScope[]> {
    const enforcement: QuotaEnforcement = {
      operation: 'assert',
      resourceType: args.resourceType,
    };

    try {
      const [limitCounters, { allowanceCounter, isAllowanceSkipped }] =
        await Promise.all([
          this.buildLimitCounters(args),
          this.buildAllowanceCounterAdmittingOnFailure(args.workspaceId),
        ]);

      const counters: QuotaCounter[] = [
        ...limitCounters,
        ...(isDefined(allowanceCounter) ? [allowanceCounter] : []),
      ];

      const { consumedValues, isDegraded } = await this.consumeCounters({
        workspaceId: args.workspaceId,
        counters,
        amounts: counters.map(() => 0),
      });

      if (isDegraded || isAllowanceSkipped) {
        this.countAdmitOnFailure(enforcement);
      }

      return findExhaustedCounters({ counters, consumedValues, cost }).map(
        (counter) =>
          buildQuotaExhaustedScope({
            resourceType: args.resourceType,
            counter,
          }),
      );
    } catch (error) {
      return this.admitOnFailure({
        error,
        workspaceId: args.workspaceId,
        enforcement,
        admitted: [],
      });
    }
  }

  private async debitCountersAdmittingOnFailure({
    workspaceId,
    events,
  }: {
    workspaceId: string;
    events: RecordUsageInput[];
  }): Promise<ExhaustedKind | null> {
    try {
      const [limitCounters, { allowanceCounter, isAllowanceSkipped }] =
        await Promise.all([
          this.buildLimitCountersForEvents({ workspaceId, events }),
          this.buildAllowanceCounterAdmittingOnFailure(workspaceId),
        ]);

      const debits = buildQuotaDebits({
        counters: [
          ...limitCounters,
          ...(isDefined(allowanceCounter) ? [allowanceCounter] : []),
        ],
        events,
      });

      const counters = debits.map((debit) => debit.counter);

      const { consumedValues, isDegraded } = await this.consumeCounters({
        workspaceId,
        counters,
        amounts: debits.map((debit) => debit.amount),
      });

      if (isDegraded || isAllowanceSkipped) {
        this.countConsumeAdmittedOnFailure({
          events,
          isAllowanceUnmetered:
            isAllowanceSkipped ||
            counters.some(
              (counter, index) =>
                counter.kind === 'allowance' &&
                !isDefined(consumedValues[index]) &&
                counter.periodEnd.getTime() > Date.now(),
            ),
        });
      }

      const exhaustedCounters = findExhaustedCounters({
        counters,
        consumedValues,
      });

      if (exhaustedCounters.some((counter) => counter.kind === 'allowance')) {
        return 'allowance';
      }

      return exhaustedCounters.length > 0 ? 'limit' : null;
    } catch (error) {
      this.logger.error(
        `Usage quota debit degraded for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      this.countConsumeAdmittedOnFailure({
        events,
        isAllowanceUnmetered: true,
      });

      return null;
    }
  }

  private async buildLimitCountersForEvents({
    workspaceId,
    events,
  }: {
    workspaceId: string;
    events: RecordUsageInput[];
  }): Promise<LimitQuotaCounter[]> {
    const scopeEvents = uniqBy(events, (event) =>
      JSON.stringify([
        event.resourceType,
        event.operationType,
        buildSpendersFromUsageSpenders(event.spenders ?? {}),
      ]),
    );

    const counters = await Promise.all(
      scopeEvents.map(({ resourceType, operationType, spenders }) =>
        this.buildLimitCounters({
          workspaceId,
          resourceType,
          operationType,
          spenders: spenders ?? {},
        }),
      ),
    );

    return uniqBy(counters.flat(), (counter) => counter.key);
  }

  private countConsumeAdmittedOnFailure({
    events,
    isAllowanceUnmetered,
  }: {
    events: RecordUsageInput[];
    isAllowanceUnmetered: boolean;
  }): void {
    for (const resourceType of new Set(
      events.map((event) => event.resourceType),
    )) {
      this.countAdmitOnFailure({
        operation: 'consume',
        resourceType,
        creditsUsedMicro: isAllowanceUnmetered
          ? events
              .filter((event) => event.resourceType === resourceType)
              .reduce(
                (total, event) =>
                  total +
                  Number(
                    fromRecordUsageInputToUsageConsumptionRow(event)
                      .creditsUsedMicro,
                  ),
                0,
              )
          : undefined,
      });
    }
  }

  private admitOnFailure<TAdmitted>({
    error,
    workspaceId,
    enforcement,
    admitted,
  }: {
    error: unknown;
    workspaceId: string;
    enforcement?: QuotaEnforcement;
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

    if (isDefined(enforcement)) {
      this.countAdmitOnFailure(enforcement);
    }

    return admitted;
  }

  private countAdmitOnFailure({
    operation,
    resourceType,
    creditsUsedMicro,
  }: QuotaEnforcement): void {
    const attributes = { operation, resourceType };

    this.metricsService.incrementCounterBy({
      key: MetricsKeys.UsageLimitQuotaAdmittedOnFailure,
      amount: 1,
      attributes,
    });

    if (isDefined(creditsUsedMicro) && creditsUsedMicro > 0) {
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.UsageLimitQuotaAdmittedOnFailureCreditsMicro,
        amount: creditsUsedMicro,
        attributes,
      });
    }
  }

  private async buildLimitCounters({
    workspaceId,
    resourceType,
    operationType,
    spenders,
  }: QuotaConsumeArgs): Promise<LimitQuotaCounter[]> {
    const quotaLimitDefaults = await this.buildQuotaLimitDefaults({
      workspaceId,
      resourceType,
    });

    const quotaLimits = await this.findQuotaLimits({
      workspaceId,
      resourceType,
    });

    if (quotaLimits.length === 0 && quotaLimitDefaults.length === 0) {
      return [];
    }

    return buildQuotaCounters({
      limits: quotaLimits,
      quotaLimitDefaults,
      usageSpenders: spenders,
      workspaceId,
      operationType,
      periodByUnit: await this.usagePeriodService.findCurrentPeriodsByUnit({
        workspaceId,
        periodUnits: [
          ...quotaLimits.map((limit) => limit.periodUnit),
          ...quotaLimitDefaults.map(
            (quotaLimitDefault) => quotaLimitDefault.periodUnit,
          ),
        ],
      }),
    });
  }

  private async buildQuotaLimitDefaults({
    workspaceId,
    resourceType,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
  }): Promise<QuotaLimitDefault[]> {
    if (!this.twentyConfigService.get('CLICKHOUSE_URL')) {
      return [];
    }

    const definition = findUsageLimitDefinition({
      resourceType,
      limitKind: 'quota',
    });

    const quotaLimitDefaults = await Promise.all(
      (definition?.defaults ?? []).map(
        async ({
          limitValueConfigVariable,
          ...quotaLimitDefaultDefinition
        }) => {
          const limitValue =
            await this.usageLimitDefaultValueService.findDefaultLimitValue({
              workspaceId,
              limitValueConfigVariable,
            });

          return isDefined(limitValue)
            ? [{ ...quotaLimitDefaultDefinition, limitValue }]
            : [];
        },
      ),
    );

    return quotaLimitDefaults.flat();
  }

  private async buildAllowanceCounterAdmittingOnFailure(
    workspaceId: string,
  ): Promise<{
    allowanceCounter: AllowanceQuotaCounter | null;
    isAllowanceSkipped: boolean;
  }> {
    try {
      return {
        allowanceCounter: await this.buildAllowanceCounter(workspaceId),
        isAllowanceSkipped: false,
      };
    } catch (error) {
      if (error instanceof WorkspaceCacheException) {
        throw error;
      }

      this.logger.error(
        `Usage quota allowance skipped for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return { allowanceCounter: null, isAllowanceSkipped: true };
    }
  }

  private async buildAllowanceCounter(
    workspaceId: string,
  ): Promise<AllowanceQuotaCounter | null> {
    if (
      !(await this.billingCreditAllowanceService.isCreditAllowanceEnabled())
    ) {
      return null;
    }

    const allowance =
      await this.billingCreditAllowanceService.getCreditAllowance(workspaceId);

    if (!isDefined(allowance)) {
      return null;
    }

    return {
      kind: 'allowance',
      key: buildAllowanceCounterKey({
        workspaceId,
        periodStart: allowance.periodStart,
      }),
      limitValue: computeCreditAllowanceMicro({
        planAllowanceMicro: allowance.planAllowanceMicro,
        grants: allowance.grants,
        nowMs: Date.now(),
      }),
      unit: UsageUnit.CREDIT,
      periodStart: allowance.periodStart,
      periodEnd: allowance.periodEnd,
    };
  }

  private async findQuotaLimits({
    workspaceId,
    resourceType,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
  }): Promise<FlatQuotaLimit[]> {
    const { usageLimits } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['usageLimits'],
    );

    const quotaLimits = findLimitsForResource({
      usageLimits,
      resourceType,
    }).filter(isQuotaLimit);

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
    const storedValues = await this.cacheStorage.mget<number>(
      counters.map((counter) => counter.key),
    );

    const coldCounters = counters.filter(
      (_, index) => !isDefined(storedValues[index]),
    );

    const warmValues = await this.fetchWarmValues({
      workspaceId,
      counters: coldCounters,
    });

    const warmedValueByKey = new Map(
      coldCounters.map((counter, index) => [counter.key, warmValues[index]]),
    );

    return counters.map(
      (counter, index) =>
        storedValues[index] ?? warmedValueByKey.get(counter.key) ?? null,
    );
  }

  private async consumeCounters({
    workspaceId,
    counters,
    amounts,
  }: {
    workspaceId: string;
    counters: QuotaCounter[];
    amounts: number[];
  }): Promise<QuotaConsumeResult> {
    const consumedValues = await this.runWarmAndConsumeScript({
      counters,
      entries: amounts.map((amount) => ({ amount, warm: null })),
    });

    const now = Date.now();

    const coldIndexes = consumedValues.flatMap((consumedValue, index) =>
      !isDefined(consumedValue) && counters[index].periodEnd.getTime() > now
        ? [index]
        : [],
    );

    if (coldIndexes.length === 0) {
      return { consumedValues, isDegraded: false };
    }

    try {
      const warmValues = await this.fetchWarmValues({
        workspaceId,
        counters: coldIndexes.map((index) => counters[index]),
      });

      const warmedAt = Date.now();

      const warmedEntries = coldIndexes.flatMap((index, position) =>
        counters[index].periodEnd.getTime() > warmedAt
          ? [{ index, warmValue: warmValues[position] }]
          : [],
      );

      const warmedValues = await this.runWarmAndConsumeScript({
        counters: warmedEntries.map(({ index }) => counters[index]),
        entries: warmedEntries.map(({ index, warmValue }) => ({
          amount: amounts[index],
          warm: {
            value: warmValue,
            ttl: counters[index].periodEnd.getTime() - warmedAt,
          },
        })),
      });

      warmedEntries.forEach(({ index }, position) => {
        consumedValues[index] = warmedValues[position];
      });

      return { consumedValues, isDegraded: false };
    } catch (error) {
      this.logger.error(
        `Usage quota warm degraded for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return { consumedValues, isDegraded: true };
    }
  }

  private async runWarmAndConsumeScript({
    counters,
    entries,
  }: {
    counters: QuotaCounter[];
    entries: Parameters<typeof buildConsumeScriptArguments>[0];
  }): Promise<(number | null)[]> {
    if (counters.length === 0) {
      return [];
    }

    const results = await this.cacheStorage.runScript<unknown[]>({
      script: WARM_AND_CONSUME_COUNTERS_SCRIPT,
      keys: counters.map((counter) => counter.key),
      args: buildConsumeScriptArguments(entries),
    });

    return results.map((result) =>
      typeof result === 'number' ? result : null,
    );
  }

  private async fetchWarmValues({
    workspaceId,
    counters,
  }: {
    workspaceId: string;
    counters: QuotaCounter[];
  }): Promise<number[]> {
    const rowsReadsByPeriodGroup = new Map<
      string,
      Promise<UsageConsumptionRow[]>
    >();

    return Promise.all(
      counters.map(async (counter) => {
        if (counter.kind === 'allowance') {
          return this.usageAnalyticsService.getCreditsUsedMicroForBillingPeriod(
            { workspaceId, periodStart: counter.periodStart },
          );
        }

        const periodGroupKey = buildPeriodGroupKey(counter);

        const rowsRead =
          rowsReadsByPeriodGroup.get(periodGroupKey) ??
          this.fetchConsumptionRows({ workspaceId, counter });

        rowsReadsByPeriodGroup.set(periodGroupKey, rowsRead);

        return computeQuotaConsumed({ rows: await rowsRead, scope: counter });
      }),
    );
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
}
