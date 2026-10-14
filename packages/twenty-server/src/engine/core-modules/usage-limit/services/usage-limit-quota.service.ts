import { Injectable, Logger } from '@nestjs/common';

import uniqBy from 'lodash.uniqby';
import {
  assertUnreachable,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';

import { BillingCreditAllowanceService } from 'src/engine/core-modules/billing/services/billing-credit-allowance.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WARM_AND_CONSUME_COUNTERS_SCRIPT } from 'src/engine/core-modules/usage-limit/constants/warm-and-consume-counters-script.constant';
import { WARM_AND_CONSUME_USER_ALLOWANCE_FIRST_SCRIPT } from 'src/engine/core-modules/usage-limit/constants/warm-and-consume-user-allowance-first-script.constant';
import { UsageLimitException } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageLimitDefaultValueService } from 'src/engine/core-modules/usage-limit/services/usage-limit-default-value.service';
import { UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { UsagePeriodService } from 'src/engine/core-modules/usage-limit/services/usage-period.service';
import { type WorkspaceAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/workspace-allowance-quota-counter.type';
import { type ExhaustedKind } from 'src/engine/core-modules/usage-limit/types/exhausted-kind.type';
import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { type FlatQuotaLimit } from 'src/engine/core-modules/usage-limit/types/flat-quota-limit.type';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type LimitConsumption } from 'src/engine/core-modules/usage-limit/types/limit-consumption.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type UserAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/user-allowance-quota-counter.type';
import { type UserCreditsFallbackMode } from 'src/engine/core-modules/usage-limit/types/user-credits-fallback-mode.type';
import { type UserAllowanceFirstConsumeResult } from 'src/engine/core-modules/usage-limit/types/user-allowance-first-consume-result.type';
import { type QuotaAdmission } from 'src/engine/core-modules/usage-limit/types/quota-admission.type';
import { type QuotaCost } from 'src/engine/core-modules/usage-limit/types/quota-cost.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { type QuotaDebit } from 'src/engine/core-modules/usage-limit/types/quota-debit.type';
import { type QuotaDebitResult } from 'src/engine/core-modules/usage-limit/types/quota-debit-result.type';
import { type QuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/quota-limit-default.type';
import { apportionUserCredits } from 'src/engine/core-modules/usage-limit/utils/apportion-user-credits.util';
import { buildWorkspaceAllowanceCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-workspace-allowance-counter-key.util';
import { buildConsumeScriptArguments } from 'src/engine/core-modules/usage-limit/utils/build-consume-script-arguments.util';
import { buildIntraWorkspaceLimitCounterKeys } from 'src/engine/core-modules/usage-limit/utils/build-intra-workspace-limit-counter-keys.util';
import { buildLimitQuotaCounter } from 'src/engine/core-modules/usage-limit/utils/build-limit-quota-counter.util';
import { buildUserAllowanceFirstScriptArguments } from 'src/engine/core-modules/usage-limit/utils/build-user-allowance-first-script-arguments.util';
import { buildPeriodGroupKey } from 'src/engine/core-modules/usage-limit/utils/build-period-group-key.util';
import { buildQuotaCounters } from 'src/engine/core-modules/usage-limit/utils/build-quota-counters.util';
import { buildQuotaDebits } from 'src/engine/core-modules/usage-limit/utils/build-quota-debits.util';
import { buildQuotaExhaustedScope } from 'src/engine/core-modules/usage-limit/utils/build-quota-exhausted-scope.util';
import { buildSpendersFromUsageSpenders } from 'src/engine/core-modules/usage-limit/utils/build-spenders-from-usage-spenders.util';
import { computeWorkspaceAllowanceDebitAmount } from 'src/engine/core-modules/usage-limit/utils/compute-workspace-allowance-debit-amount.util';
import { computeCreditAllowanceMicro } from 'src/engine/core-modules/usage-limit/utils/compute-credit-allowance-micro.util';
import { computeQuotaConsumed } from 'src/engine/core-modules/usage-limit/utils/compute-quota-consumed.util';
import { findExhaustedCounters } from 'src/engine/core-modules/usage-limit/utils/find-exhausted-counters.util';
import { findBindingUserAllowance } from 'src/engine/core-modules/usage-limit/utils/find-binding-user-allowance.util';
import { findUserAllowanceFirstExhaustedKind } from 'src/engine/core-modules/usage-limit/utils/find-user-allowance-first-exhausted-kind.util';
import { findSuppressedUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/utils/find-suppressed-usage-limit-defaults.util';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { isQuotaLimit } from 'src/engine/core-modules/usage-limit/utils/is-quota-limit.util';
import { isWorkspaceCreditLimitCounter } from 'src/engine/core-modules/usage-limit/utils/is-workspace-credit-limit-counter.util';
import { parseUserAllowanceFirstScriptReply } from 'src/engine/core-modules/usage-limit/utils/parse-user-allowance-first-script-reply.util';
import { selectUserAllowanceFirstExhaustedCounters } from 'src/engine/core-modules/usage-limit/utils/select-user-allowance-first-exhausted-counters.util';
import { subtractUserCredits } from 'src/engine/core-modules/usage-limit/utils/subtract-user-credits.util';
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
import { isValidCreditAmountMicro } from 'src/engine/core-modules/usage/utils/is-valid-credit-amount-micro.util';
import { WorkspaceCacheException } from 'src/engine/workspace-cache/exceptions/workspace-cache.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type QuotaEnforcement = {
  operation: 'assert' | 'consume';
  resourceType: UsageResourceType;
  counterKind?: UserAllowanceQuotaCounter['kind'];
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

type CreditCounterEvent = Pick<
  RecordUsageInput,
  'resourceType' | 'operationType' | 'spenders'
>;

const buildCounterKeySignature = (counters: LimitQuotaCounter[]): string =>
  counters
    .map((counter) => counter.key)
    .sort()
    .join(' ');

type QuotaAdmissionArgs = QuotaConsumeArgs & {
  cost?: QuotaCost;
};

const QUOTA_ADMISSION_WITHOUT_USER_ALLOWANCE_COUNTER: QuotaAdmission = {
  exhaustedScope: null,
  hasUserAllowanceCounter: false,
  hasUserCreditsLeft: false,
  hasWorkspaceCreditsLeft: true,
};

type UserAllowanceFirstScriptAttempt =
  | Exclude<UserAllowanceFirstConsumeResult, { outcome: 'applied' }>
  | {
      outcome: 'ran';
      reply: ReturnType<typeof parseUserAllowanceFirstScriptReply>;
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
    args: QuotaAdmissionArgs,
  ): Promise<ExhaustedScope | null> {
    const { exhaustedScope } = await this.findAdmission(args);

    return exhaustedScope;
  }

  async findAdmission({
    requireUserAllowanceCounter = false,
    ...args
  }: QuotaAdmissionArgs & {
    requireUserAllowanceCounter?: boolean;
  }): Promise<QuotaAdmission> {
    const enforcement: QuotaEnforcement = {
      operation: 'assert',
      resourceType: args.resourceType,
    };

    try {
      return await this.findAdmissionFromCounters({
        ...args,
        requireUserAllowanceCounter,
        enforcement,
      });
    } catch (error) {
      return this.admitOnFailure({
        error,
        workspaceId: args.workspaceId,
        enforcement,
        admitted: QUOTA_ADMISSION_WITHOUT_USER_ALLOWANCE_COUNTER,
      });
    }
  }

  async charge({
    workspaceId,
    events,
  }: {
    workspaceId: string;
    events: RecordUsageInput[];
  }): Promise<
    Pick<QuotaDebitResult, 'exhaustedKind' | 'userCreditsUsedMicro'>
  > {
    if (events.length === 0) {
      return { exhaustedKind: null, userCreditsUsedMicro: 0 };
    }

    const { exhaustedKind, userCreditsUsedMicro } =
      await this.debitCountersAdmittingOnFailure({
        workspaceId,
        events,
      });

    await this.usageRecorderService.record(
      workspaceId,
      apportionUserCredits({ events, userCreditsUsedMicro }),
    );

    return { exhaustedKind, userCreditsUsedMicro };
  }

  async debitAheadOfRecord({
    workspaceId,
    event,
  }: {
    workspaceId: string;
    event: RecordUsageInput;
  }): Promise<QuotaDebitResult> {
    return this.debitCountersAdmittingOnFailure({
      workspaceId,
      events: [event],
    });
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

  async getWorkspaceAllowanceUsage(workspaceId: string): Promise<{
    limitValue: number;
    consumedValue: number | null;
    periodEnd: Date;
  } | null> {
    const counter = await this.buildWorkspaceAllowanceCounter(workspaceId);

    if (!isDefined(counter)) {
      return null;
    }

    let consumedValue: number | null = null;

    try {
      const [storedValue] = await this.cacheStorage.mget<number>([counter.key]);

      consumedValue =
        storedValue ??
        (await this.getWorkspaceCreditsUsedMicro({
          workspaceId,
          counter,
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

  async getUserAllowanceUsage({
    workspaceId,
    userWorkspaceId,
    resourceType,
    operationType,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    resourceType: UsageResourceType;
    operationType: UsageOperationType;
  }): Promise<{
    limitValue: number;
    consumedValue: number | null;
    periodEnd: Date;
    fallback: UserCreditsFallbackMode;
  } | null> {
    const events = [
      { resourceType, operationType, spenders: { userWorkspaceId } },
    ];

    const { userCreditCounters } = await this.buildQuotaCountersForEvents({
      workspaceId,
      events,
    });

    const userAllowanceCounters = await this.buildUserAllowanceCounters({
      workspaceId,
      userCreditCounters,
    });

    const { consumedValues } = await this.readCountersAdmittingOnFailure({
      workspaceId,
      counters: userAllowanceCounters,
    });

    const bindingUserAllowance = findBindingUserAllowance({
      userAllowanceCounters,
      userAllowanceConsumedValues: consumedValues,
    });

    if (!isDefined(bindingUserAllowance)) {
      return null;
    }

    return {
      limitValue: bindingUserAllowance.counter.limitValue,
      consumedValue: bindingUserAllowance.consumedValue,
      periodEnd: bindingUserAllowance.counter.periodEnd,
      fallback: bindingUserAllowance.counter.fallback,
    };
  }

  async getWorkspaceAllowanceRemainingMicro(
    workspaceId: string,
  ): Promise<number | null> {
    try {
      const counter = await this.buildWorkspaceAllowanceCounter(workspaceId);

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

  private async findAdmissionFromCounters({
    cost,
    requireUserAllowanceCounter,
    enforcement,
    ...args
  }: QuotaAdmissionArgs & {
    requireUserAllowanceCounter: boolean;
    enforcement: QuotaEnforcement;
  }): Promise<QuotaAdmission> {
    const { workspaceId, resourceType, operationType, spenders } = args;
    const events = [{ resourceType, operationType, spenders }];

    const [
      { limitCounters, userCreditCounters },
      { workspaceAllowanceCounter, isWorkspaceAllowanceSkipped },
    ] = await Promise.all([
      this.buildQuotaCountersForEvents({ workspaceId, events }),
      this.buildWorkspaceAllowanceCounterAdmittingOnFailure(workspaceId),
    ]);

    const userAllowanceCounters = await this.buildUserAllowanceCounters({
      workspaceId,
      userCreditCounters,
    });

    if (requireUserAllowanceCounter && userAllowanceCounters.length === 0) {
      return QUOTA_ADMISSION_WITHOUT_USER_ALLOWANCE_COUNTER;
    }

    const counters: QuotaCounter[] = [
      ...limitCounters,
      ...(isDefined(workspaceAllowanceCounter)
        ? [workspaceAllowanceCounter]
        : []),
    ];

    const [{ consumedValues, isDegraded }, userAllowanceConsumedValues] =
      await Promise.all([
        this.readCountersAdmittingOnFailure({ workspaceId, counters }),
        this.readUserAllowanceCountersAdmittingOnFailure({
          workspaceId,
          resourceType,
          userAllowanceCounters,
        }),
      ]);

    if (isDegraded || isWorkspaceAllowanceSkipped) {
      this.countAdmitOnFailure(enforcement);
    }

    const { exhaustedCounters, ...userAllowanceAdmission } =
      selectUserAllowanceFirstExhaustedCounters({
        exhaustedCounters: findExhaustedCounters({
          counters: [...counters, ...userAllowanceCounters],
          consumedValues: [...consumedValues, ...userAllowanceConsumedValues],
          cost,
        }),
        userAllowanceCounters,
        userAllowanceConsumedValues,
        workspaceAllowanceConsumed: isDefined(workspaceAllowanceCounter)
          ? (consumedValues[counters.indexOf(workspaceAllowanceCounter)] ??
            null)
          : null,
      });

    const exhaustedScopes = exhaustedCounters.map((counter) =>
      buildQuotaExhaustedScope({ resourceType, counter }),
    );

    const [latestUserAllowanceScope] = exhaustedScopes
      .filter((scope) => scope.exhaustedKind === 'userAllowance')
      .sort((first, second) => second.retryAfterMs - first.retryAfterMs);

    const exhaustedScope =
      exhaustedScopes.find(
        (scope) => scope.exhaustedKind === 'workspaceAllowance',
      ) ??
      latestUserAllowanceScope ??
      exhaustedScopes[0] ??
      null;

    return { exhaustedScope, ...userAllowanceAdmission };
  }

  private async readUserAllowanceCountersAdmittingOnFailure({
    workspaceId,
    resourceType,
    userAllowanceCounters,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
    userAllowanceCounters: UserAllowanceQuotaCounter[];
  }): Promise<(number | null)[]> {
    if (userAllowanceCounters.length === 0) {
      return [];
    }

    const { consumedValues, isDegraded } =
      await this.readCountersAdmittingOnFailure({
        workspaceId,
        counters: userAllowanceCounters,
      });

    if (isDegraded) {
      this.countAdmitOnFailure({
        operation: 'assert',
        resourceType,
        counterKind: 'userAllowance',
      });
    }

    return consumedValues;
  }

  private async readCountersAdmittingOnFailure({
    workspaceId,
    counters,
  }: {
    workspaceId: string;
    counters: QuotaCounter[];
  }): Promise<QuotaConsumeResult> {
    try {
      return await this.consumeCounters({
        workspaceId,
        counters,
        amounts: counters.map(() => 0),
      });
    } catch (error) {
      return this.admitOnFailure({
        error,
        workspaceId,
        admitted: {
          consumedValues: counters.map(() => null),
          isDegraded: true,
        },
      });
    }
  }

  private async debitCountersAdmittingOnFailure({
    workspaceId,
    events,
  }: {
    workspaceId: string;
    events: RecordUsageInput[];
  }): Promise<QuotaDebitResult> {
    try {
      const [
        { limitCounters, userCreditCounters },
        { workspaceAllowanceCounter, isWorkspaceAllowanceSkipped },
      ] = await Promise.all([
        this.buildQuotaCountersForEvents({ workspaceId, events }),
        this.buildWorkspaceAllowanceCounterAdmittingOnFailure(workspaceId),
      ]);

      const userAllowanceCounters = await this.buildUserAllowanceCounters({
        workspaceId,
        userCreditCounters,
      });

      const amount = computeWorkspaceAllowanceDebitAmount({ events });

      if (userAllowanceCounters.length > 0 && amount > 0) {
        return await this.debitUserAllowanceFirst({
          workspaceId,
          events,
          limitCounters,
          workspaceAllowanceCounter,
          userAllowanceCounters,
          amount,
        });
      }

      return {
        exhaustedKind: await this.debitWorkspaceCreditCounters({
          workspaceId,
          events,
          counters: [
            ...limitCounters,
            ...(isDefined(workspaceAllowanceCounter)
              ? [workspaceAllowanceCounter]
              : []),
          ],
          isWorkspaceAllowanceSkipped,
        }),
        userCreditsUsedMicro: 0,
        isUserAllowanceExhausted: false,
        userAllowancePeriodEnd: null,
      };
    } catch (error) {
      this.logger.error(
        `Usage quota debit degraded for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      this.countConsumeAdmittedOnFailure({
        events,
        isWorkspaceAllowanceUnmetered: true,
      });

      return {
        exhaustedKind: null,
        userCreditsUsedMicro: 0,
        isUserAllowanceExhausted: false,
        userAllowancePeriodEnd: null,
      };
    }
  }

  private async debitWorkspaceCreditCounters({
    workspaceId,
    events,
    counters: candidateCounters,
    isWorkspaceAllowanceSkipped,
  }: {
    workspaceId: string;
    events: RecordUsageInput[];
    counters: QuotaCounter[];
    isWorkspaceAllowanceSkipped: boolean;
  }): Promise<ExhaustedKind | null> {
    const debits = buildQuotaDebits({ counters: candidateCounters, events });

    const counters = debits.map((debit) => debit.counter);

    const { consumedValues, isDegraded } = await this.consumeCounters({
      workspaceId,
      counters,
      amounts: debits.map((debit) => debit.amount),
    });

    if (isDegraded || isWorkspaceAllowanceSkipped) {
      this.countConsumeAdmittedOnFailure({
        events,
        isWorkspaceAllowanceUnmetered:
          isWorkspaceAllowanceSkipped ||
          counters.some(
            (counter, index) =>
              counter.kind === 'workspaceAllowance' &&
              !isDefined(consumedValues[index]) &&
              counter.periodEnd.getTime() > Date.now(),
          ),
      });
    }

    const exhaustedCounters = findExhaustedCounters({
      counters,
      consumedValues,
    });

    if (
      exhaustedCounters.some((counter) => counter.kind === 'workspaceAllowance')
    ) {
      return 'workspaceAllowance';
    }

    return exhaustedCounters.length > 0 ? 'limit' : null;
  }

  private async debitUserAllowanceFirst({
    workspaceId,
    events,
    limitCounters,
    workspaceAllowanceCounter,
    userAllowanceCounters,
    amount,
  }: {
    workspaceId: string;
    events: RecordUsageInput[];
    limitCounters: LimitQuotaCounter[];
    workspaceAllowanceCounter: WorkspaceAllowanceQuotaCounter | null;
    userAllowanceCounters: UserAllowanceQuotaCounter[];
    amount: number;
  }): Promise<QuotaDebitResult> {
    const [{ fallback }] = userAllowanceCounters;

    const limitDebits = buildQuotaDebits({
      counters: limitCounters.filter(
        (counter) => !isWorkspaceCreditLimitCounter(counter),
      ),
      events,
    });

    const [limitConsumedValues, userAllowanceFirstConsume] = await Promise.all([
      this.consumeLimitDebitsAdmittingOnFailure({
        workspaceId,
        events,
        debits: limitDebits,
      }),
      this.consumeUserAllowanceFirst({
        workspaceId,
        userAllowanceCounters,
        workspaceAllowanceCounter,
        amount,
      }),
    ]);

    const {
      userAllowanceConsumedValues,
      workspaceAllowanceConsumed,
      userCreditsUsedMicro,
    } = await this.settleUserAllowanceFirstConsume({
      workspaceId,
      events,
      workspaceAllowanceCounter,
      userAllowanceCounters,
      amount,
      userAllowanceFirstConsume,
    });

    const workspaceCreditLimitDebits = buildQuotaDebits({
      counters: limitCounters.filter(isWorkspaceCreditLimitCounter),
      events: subtractUserCredits({ events, userCreditsUsedMicro }),
    });

    const workspaceCreditLimitConsumedValues =
      await this.consumeLimitDebitsAdmittingOnFailure({
        workspaceId,
        events,
        debits: workspaceCreditLimitDebits,
      });

    const bindingUserAllowance = findBindingUserAllowance({
      userAllowanceCounters,
      userAllowanceConsumedValues,
    });
    const isUserAllowanceExhausted = bindingUserAllowance?.isExhausted ?? false;

    return {
      exhaustedKind: findUserAllowanceFirstExhaustedKind({
        outcome: userAllowanceFirstConsume.outcome,
        fallback,
        isUserAllowanceExhausted,
        workspaceAllowanceConsumed,
        workspaceAllowanceLimitValue:
          workspaceAllowanceCounter?.limitValue ?? null,
        hasExhaustedLimitCounter:
          findExhaustedCounters({
            counters: [...limitDebits, ...workspaceCreditLimitDebits].map(
              (debit) => debit.counter,
            ),
            consumedValues: [
              ...limitConsumedValues,
              ...workspaceCreditLimitConsumedValues,
            ],
          }).length > 0,
      }),
      userCreditsUsedMicro,
      isUserAllowanceExhausted,
      userAllowancePeriodEnd: bindingUserAllowance?.counter.periodEnd ?? null,
    };
  }

  private async settleUserAllowanceFirstConsume({
    workspaceId,
    events,
    workspaceAllowanceCounter,
    userAllowanceCounters,
    amount,
    userAllowanceFirstConsume,
  }: {
    workspaceId: string;
    events: RecordUsageInput[];
    workspaceAllowanceCounter: WorkspaceAllowanceQuotaCounter | null;
    userAllowanceCounters: UserAllowanceQuotaCounter[];
    amount: number;
    userAllowanceFirstConsume: UserAllowanceFirstConsumeResult;
  }): Promise<{
    userAllowanceConsumedValues: (number | null)[];
    workspaceAllowanceConsumed: number | null;
    userCreditsUsedMicro: number;
  }> {
    const [{ resourceType }] = events;
    const unreadUserAllowanceConsumedValues = userAllowanceCounters.map(
      () => null,
    );

    switch (userAllowanceFirstConsume.outcome) {
      case 'applied': {
        const {
          userShare,
          userAllowanceConsumedValues,
          workspaceAllowanceConsumed,
        } = userAllowanceFirstConsume;

        if (userAllowanceFirstConsume.isWorkspaceAllowanceUnmetered) {
          this.countAdmitOnFailure({
            operation: 'consume',
            resourceType,
            creditsUsedMicro: amount - userShare,
          });
        }

        return {
          userAllowanceConsumedValues,
          workspaceAllowanceConsumed,
          userCreditsUsedMicro: userShare,
        };
      }
      case 'userAllowanceUnavailable': {
        const workspaceAllowanceConsumed =
          await this.consumeWorkspaceAllowanceAdmittingOnFailure({
            workspaceId,
            workspaceAllowanceCounter,
            amount,
          });

        this.countAdmitOnFailure({
          operation: 'consume',
          resourceType,
          counterKind: 'userAllowance',
          creditsUsedMicro: isDefined(workspaceAllowanceConsumed) ? 0 : amount,
        });

        return {
          userAllowanceConsumedValues: unreadUserAllowanceConsumedValues,
          workspaceAllowanceConsumed,
          userCreditsUsedMicro: 0,
        };
      }
      case 'unknown':
        this.countAdmitOnFailure({
          operation: 'consume',
          resourceType,
          counterKind: 'userAllowance',
          creditsUsedMicro: amount,
        });

        return {
          userAllowanceConsumedValues: unreadUserAllowanceConsumedValues,
          workspaceAllowanceConsumed: null,
          userCreditsUsedMicro: 0,
        };
      default:
        return assertUnreachable(userAllowanceFirstConsume);
    }
  }

  private async consumeLimitDebitsAdmittingOnFailure({
    workspaceId,
    events,
    debits,
  }: {
    workspaceId: string;
    events: RecordUsageInput[];
    debits: QuotaDebit[];
  }): Promise<(number | null)[]> {
    try {
      const { consumedValues, isDegraded } = await this.consumeCounters({
        workspaceId,
        counters: debits.map((debit) => debit.counter),
        amounts: debits.map((debit) => debit.amount),
      });

      if (isDegraded) {
        this.countConsumeAdmittedOnFailure({
          events,
          isWorkspaceAllowanceUnmetered: false,
        });
      }

      return consumedValues;
    } catch (error) {
      this.logger.error(
        `Usage quota limit debit degraded for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      this.countConsumeAdmittedOnFailure({
        events,
        isWorkspaceAllowanceUnmetered: false,
      });

      return debits.map(() => null);
    }
  }

  private async consumeWorkspaceAllowanceAdmittingOnFailure({
    workspaceId,
    workspaceAllowanceCounter,
    amount,
  }: {
    workspaceId: string;
    workspaceAllowanceCounter: WorkspaceAllowanceQuotaCounter | null;
    amount: number;
  }): Promise<number | null> {
    if (!isDefined(workspaceAllowanceCounter)) {
      return null;
    }

    try {
      const {
        consumedValues: [workspaceAllowanceConsumed],
      } = await this.consumeCounters({
        workspaceId,
        counters: [workspaceAllowanceCounter],
        amounts: [amount],
      });

      return workspaceAllowanceConsumed ?? null;
    } catch (error) {
      this.logger.error(
        `Usage quota allowance debit degraded for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return null;
    }
  }

  private async consumeUserAllowanceFirst({
    workspaceId,
    userAllowanceCounters,
    workspaceAllowanceCounter,
    amount,
  }: {
    workspaceId: string;
    userAllowanceCounters: UserAllowanceQuotaCounter[];
    workspaceAllowanceCounter: WorkspaceAllowanceQuotaCounter | null;
    amount: number;
  }): Promise<UserAllowanceFirstConsumeResult> {
    const [{ fallback }] = userAllowanceCounters;
    const scriptWorkspaceAllowanceCounter =
      fallback === 'WORKSPACE_CREDITS' ? workspaceAllowanceCounter : null;
    const counters = isDefined(scriptWorkspaceAllowanceCounter)
      ? [...userAllowanceCounters, scriptWorkspaceAllowanceCounter]
      : userAllowanceCounters;

    const firstAttempt = await this.attemptUserAllowanceFirstScript({
      workspaceId,
      counters,
      userAllowanceCounters,
      amount,
      warms: counters.map(() => null),
    });

    if (firstAttempt.outcome !== 'ran') {
      return firstAttempt;
    }

    const { reply: firstReply } = firstAttempt;

    if (firstReply.userShare !== null) {
      return {
        outcome: 'applied',
        userShare: firstReply.userShare,
        userAllowanceConsumedValues: firstReply.userAllowanceConsumedValues,
        workspaceAllowanceConsumed: firstReply.workspaceAllowanceConsumed,
        isWorkspaceAllowanceUnmetered: false,
      };
    }

    const coldUserAllowanceCounters = userAllowanceCounters.filter(
      (_, index) => !isDefined(firstReply.userAllowanceConsumedValues[index]),
    );
    const isWorkspaceAllowanceCold =
      isDefined(scriptWorkspaceAllowanceCounter) &&
      !isDefined(firstReply.workspaceAllowanceConsumed);

    const [userAllowanceWarms, workspaceAllowanceWarm] =
      await Promise.allSettled([
        this.fetchWarmValues({
          workspaceId,
          counters: coldUserAllowanceCounters,
        }),
        isWorkspaceAllowanceCold
          ? this.fetchWarmValue({
              workspaceId,
              counter: scriptWorkspaceAllowanceCounter,
            })
          : null,
      ]);

    if (userAllowanceWarms.status === 'rejected') {
      this.logger.error(
        `User credits warm failed for workspace ${workspaceId}: ${userAllowanceWarms.reason instanceof Error ? userAllowanceWarms.reason.message : 'unknown error'}`,
      );

      return { outcome: 'userAllowanceUnavailable' };
    }

    if (workspaceAllowanceWarm.status === 'rejected') {
      this.logger.error(
        `Usage quota allowance warm failed for workspace ${workspaceId}: ${workspaceAllowanceWarm.reason instanceof Error ? workspaceAllowanceWarm.reason.message : 'unknown error'}`,
      );
    }

    const warmedAt = Date.now();

    if (
      userAllowanceCounters.some(
        (counter) => counter.periodEnd.getTime() <= warmedAt,
      )
    ) {
      return { outcome: 'userAllowanceUnavailable' };
    }

    const isWorkspaceAllowanceUnmetered =
      isWorkspaceAllowanceCold &&
      (workspaceAllowanceWarm.status === 'rejected' ||
        scriptWorkspaceAllowanceCounter.periodEnd.getTime() <= warmedAt);
    const warmedCounters = isWorkspaceAllowanceUnmetered
      ? userAllowanceCounters
      : counters;

    const warmValueByKey = new Map<string, number | null>([
      ...coldUserAllowanceCounters.map(
        (counter, index) =>
          [counter.key, userAllowanceWarms.value[index]] as const,
      ),
      ...(isDefined(scriptWorkspaceAllowanceCounter) &&
      workspaceAllowanceWarm.status === 'fulfilled'
        ? [
            [
              scriptWorkspaceAllowanceCounter.key,
              workspaceAllowanceWarm.value,
            ] as const,
          ]
        : []),
    ]);

    const secondAttempt = await this.attemptUserAllowanceFirstScript({
      workspaceId,
      counters: warmedCounters,
      userAllowanceCounters,
      amount,
      warms: warmedCounters.map((counter) => {
        const warmValue = warmValueByKey.get(counter.key);

        return isDefined(warmValue)
          ? { value: warmValue, ttl: counter.periodEnd.getTime() - warmedAt }
          : null;
      }),
    });

    if (secondAttempt.outcome !== 'ran') {
      return secondAttempt;
    }

    const { reply: secondReply } = secondAttempt;

    if (secondReply.userShare === null) {
      return { outcome: 'userAllowanceUnavailable' };
    }

    return {
      outcome: 'applied',
      userShare: secondReply.userShare,
      userAllowanceConsumedValues: secondReply.userAllowanceConsumedValues,
      workspaceAllowanceConsumed: secondReply.workspaceAllowanceConsumed,
      isWorkspaceAllowanceUnmetered,
    };
  }

  private async attemptUserAllowanceFirstScript({
    workspaceId,
    counters,
    userAllowanceCounters,
    amount,
    warms,
  }: {
    workspaceId: string;
    counters: (UserAllowanceQuotaCounter | WorkspaceAllowanceQuotaCounter)[];
    userAllowanceCounters: UserAllowanceQuotaCounter[];
    amount: number;
    warms: ({ value: number; ttl: number } | null)[];
  }): Promise<UserAllowanceFirstScriptAttempt> {
    const [{ fallback }] = userAllowanceCounters;

    let scriptArguments: string[];

    try {
      scriptArguments = buildUserAllowanceFirstScriptArguments({
        amount,
        userAllowanceLimits: userAllowanceCounters.map(
          (counter) => counter.limitValue,
        ),
        isFallbackEnabled: fallback === 'WORKSPACE_CREDITS',
        warms,
      });
    } catch (error) {
      this.logger.error(
        `User credits debit skipped for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return { outcome: 'userAllowanceUnavailable' };
    }

    try {
      const reply = await this.cacheStorage.runScript<unknown>({
        script: WARM_AND_CONSUME_USER_ALLOWANCE_FIRST_SCRIPT,
        keys: counters.map((counter) => counter.key),
        args: scriptArguments,
      });

      return {
        outcome: 'ran',
        reply: parseUserAllowanceFirstScriptReply({
          reply,
          userAllowanceCount: userAllowanceCounters.length,
        }),
      };
    } catch (error) {
      this.logger.error(
        `User credits debit outcome unknown for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return { outcome: 'unknown' };
    }
  }

  private async buildQuotaCountersForEvents({
    workspaceId,
    events,
  }: {
    workspaceId: string;
    events: CreditCounterEvent[];
  }): Promise<{
    limitCounters: LimitQuotaCounter[];
    userCreditCounters: LimitQuotaCounter[][];
  }> {
    const scopeEvents = uniqBy(events, (event) =>
      JSON.stringify([
        event.resourceType,
        event.operationType,
        buildSpendersFromUsageSpenders(event.spenders ?? {}),
      ]),
    );

    const countersByScopeEvent = await Promise.all(
      scopeEvents.map(({ resourceType, operationType, spenders }) =>
        this.buildQuotaCountersForScope({
          workspaceId,
          resourceType,
          operationType,
          spenders: spenders ?? {},
        }),
      ),
    );

    return {
      limitCounters: uniqBy(
        countersByScopeEvent
          .flat()
          .filter((counter) => counter.unit !== UsageUnit.USER_CREDIT),
        (counter) => counter.key,
      ),
      userCreditCounters: countersByScopeEvent.map((counters) =>
        counters.filter((counter) => counter.unit === UsageUnit.USER_CREDIT),
      ),
    };
  }

  private countConsumeAdmittedOnFailure({
    events,
    isWorkspaceAllowanceUnmetered,
  }: {
    events: RecordUsageInput[];
    isWorkspaceAllowanceUnmetered: boolean;
  }): void {
    for (const resourceType of new Set(
      events.map((event) => event.resourceType),
    )) {
      this.countAdmitOnFailure({
        operation: 'consume',
        resourceType,
        creditsUsedMicro: isWorkspaceAllowanceUnmetered
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
    counterKind,
    creditsUsedMicro,
  }: QuotaEnforcement): void {
    const attributes = {
      operation,
      resourceType,
      ...(isDefined(counterKind) && { counterKind }),
    };

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

  private async buildQuotaCountersForScope({
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

  private async buildWorkspaceAllowanceCounterAdmittingOnFailure(
    workspaceId: string,
  ): Promise<{
    workspaceAllowanceCounter: WorkspaceAllowanceQuotaCounter | null;
    isWorkspaceAllowanceSkipped: boolean;
  }> {
    try {
      return {
        workspaceAllowanceCounter:
          await this.buildWorkspaceAllowanceCounter(workspaceId),
        isWorkspaceAllowanceSkipped: false,
      };
    } catch (error) {
      if (error instanceof WorkspaceCacheException) {
        throw error;
      }

      this.logger.error(
        `Usage quota allowance skipped for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return {
        workspaceAllowanceCounter: null,
        isWorkspaceAllowanceSkipped: true,
      };
    }
  }

  private async buildWorkspaceAllowanceCounter(
    workspaceId: string,
  ): Promise<WorkspaceAllowanceQuotaCounter | null> {
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
      kind: 'workspaceAllowance',
      key: buildWorkspaceAllowanceCounterKey({
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

  private async buildUserAllowanceCounters({
    workspaceId,
    userCreditCounters,
  }: {
    workspaceId: string;
    userCreditCounters: LimitQuotaCounter[][];
  }): Promise<UserAllowanceQuotaCounter[]> {
    const [scopeUserCreditCounters = []] = userCreditCounters;
    const scopeKeys = buildCounterKeySignature(scopeUserCreditCounters);

    if (
      scopeUserCreditCounters.length === 0 ||
      !userCreditCounters.every(
        (counters) => buildCounterKeySignature(counters) === scopeKeys,
      ) ||
      !scopeUserCreditCounters.every(
        (counter) =>
          isValidCreditAmountMicro(counter.limitValue) &&
          counter.limitValue > 0,
      )
    ) {
      return [];
    }

    try {
      const fallback =
        await this.billingCreditAllowanceService.getUserCreditsFallback(
          workspaceId,
        );

      return scopeUserCreditCounters.map((counter) => ({
        ...counter,
        kind: 'userAllowance',
        fallback,
      }));
    } catch (error) {
      this.logger.error(
        `User credits unavailable for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return [];
    }
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

    const quotaLimits = (usageLimits.byResourceType[resourceType] ?? []).filter(
      isQuotaLimit,
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
        switch (counter.kind) {
          case 'workspaceAllowance':
            return this.getWorkspaceCreditsUsedMicro({
              workspaceId,
              counter,
            });
          case 'userAllowance':
            return this.usageAnalyticsService.getUserCreditsUsedMicroForScope({
              workspaceId,
              resourceType: counter.resourceType,
              operationType: counter.operationType,
              spenderType: counter.spenderType,
              spenderId: counter.spenderId,
              periodStart: counter.periodStart,
              periodEnd: counter.periodEnd,
              periodAnchor: getPeriodAnchor(counter.periodUnit),
            });
          case 'limit': {
            const periodGroupKey = buildPeriodGroupKey(counter);

            const rowsRead =
              rowsReadsByPeriodGroup.get(periodGroupKey) ??
              this.fetchConsumptionRows({ workspaceId, counter });

            rowsReadsByPeriodGroup.set(periodGroupKey, rowsRead);

            const consumed = computeQuotaConsumed({
              rows: await rowsRead,
              scope: counter,
            });

            return isWorkspaceCreditLimitCounter(counter)
              ? consumed -
                  (await this.usageAnalyticsService.getUserCreditsUsedMicroForScope(
                    {
                      workspaceId,
                      resourceType: counter.resourceType,
                      operationType: counter.operationType,
                      spenderType: counter.spenderType,
                      spenderId: counter.spenderId,
                      periodStart: counter.periodStart,
                      periodEnd: counter.periodEnd,
                      periodAnchor: getPeriodAnchor(counter.periodUnit),
                    },
                  ))
              : consumed;
          }
          default:
            return assertUnreachable(counter);
        }
      }),
    );
  }

  private async fetchWarmValue({
    workspaceId,
    counter,
  }: {
    workspaceId: string;
    counter: QuotaCounter;
  }): Promise<number> {
    const [warmValue] = await this.fetchWarmValues({
      workspaceId,
      counters: [counter],
    });

    return warmValue;
  }

  private async getWorkspaceCreditsUsedMicro({
    workspaceId,
    counter,
  }: {
    workspaceId: string;
    counter: WorkspaceAllowanceQuotaCounter;
  }): Promise<number> {
    const { workspaceCreditsUsedMicro } =
      await this.usageAnalyticsService.getCreditsUsedMicroForBillingPeriod({
        workspaceId,
        periodStart: counter.periodStart,
        periodEnd: counter.periodEnd,
      });

    return workspaceCreditsUsedMicro;
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
