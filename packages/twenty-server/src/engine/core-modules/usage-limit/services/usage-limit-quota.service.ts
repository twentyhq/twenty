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
import { MEMBER_ALLOWANCE_STOP_OVERSHOOT_MICRO_BUCKET_BOUNDARIES } from 'src/engine/core-modules/metrics/constants/member-allowance-stop-overshoot-micro-bucket-boundaries.constant';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WARM_AND_CONSUME_COUNTERS_SCRIPT } from 'src/engine/core-modules/usage-limit/constants/warm-and-consume-counters-script.constant';
import { WARM_AND_CONSUME_MEMBER_FIRST_SCRIPT } from 'src/engine/core-modules/usage-limit/constants/warm-and-consume-member-first-script.constant';
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
import { type MemberAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/member-allowance-quota-counter.type';
import { type MemberCreditsAllowance } from 'src/engine/core-modules/usage-limit/types/member-credits-allowance.type';
import { type MemberCreditsFallbackMode } from 'src/engine/core-modules/usage-limit/types/member-credits-fallback-mode.type';
import { type MemberCreditsPayer } from 'src/engine/core-modules/usage-limit/types/member-credits-payer.type';
import { type MemberFirstConsumeResult } from 'src/engine/core-modules/usage-limit/types/member-first-consume-result.type';
import { type QuotaAdmission } from 'src/engine/core-modules/usage-limit/types/quota-admission.type';
import { type QuotaCost } from 'src/engine/core-modules/usage-limit/types/quota-cost.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { type QuotaDebit } from 'src/engine/core-modules/usage-limit/types/quota-debit.type';
import { type QuotaDebitResult } from 'src/engine/core-modules/usage-limit/types/quota-debit-result.type';
import { type QuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/quota-limit-default.type';
import { apportionMemberCredits } from 'src/engine/core-modules/usage-limit/utils/apportion-member-credits.util';
import { buildAllowanceCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-allowance-counter-key.util';
import { buildConsumeScriptArguments } from 'src/engine/core-modules/usage-limit/utils/build-consume-script-arguments.util';
import { buildIntraWorkspaceLimitCounterKeys } from 'src/engine/core-modules/usage-limit/utils/build-intra-workspace-limit-counter-keys.util';
import { buildLimitQuotaCounter } from 'src/engine/core-modules/usage-limit/utils/build-limit-quota-counter.util';
import { buildMemberAllowanceCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-member-allowance-counter-key.util';
import { buildMemberFirstScriptArguments } from 'src/engine/core-modules/usage-limit/utils/build-member-first-script-arguments.util';
import { buildPeriodGroupKey } from 'src/engine/core-modules/usage-limit/utils/build-period-group-key.util';
import { buildQuotaCounters } from 'src/engine/core-modules/usage-limit/utils/build-quota-counters.util';
import { buildQuotaDebits } from 'src/engine/core-modules/usage-limit/utils/build-quota-debits.util';
import { buildQuotaExhaustedScope } from 'src/engine/core-modules/usage-limit/utils/build-quota-exhausted-scope.util';
import { buildSpendersFromUsageSpenders } from 'src/engine/core-modules/usage-limit/utils/build-spenders-from-usage-spenders.util';
import { computeAllowanceDebitAmount } from 'src/engine/core-modules/usage-limit/utils/compute-allowance-debit-amount.util';
import { computeCreditAllowanceMicro } from 'src/engine/core-modules/usage-limit/utils/compute-credit-allowance-micro.util';
import { computeQuotaConsumed } from 'src/engine/core-modules/usage-limit/utils/compute-quota-consumed.util';
import { findExhaustedCounters } from 'src/engine/core-modules/usage-limit/utils/find-exhausted-counters.util';
import { findMemberFirstExhaustedKind } from 'src/engine/core-modules/usage-limit/utils/find-member-first-exhausted-kind.util';
import { findSuppressedUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/utils/find-suppressed-usage-limit-defaults.util';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { isMemberCreditsEligibleEvent } from 'src/engine/core-modules/usage-limit/utils/is-member-credits-eligible-event.util';
import { isQuotaLimit } from 'src/engine/core-modules/usage-limit/utils/is-quota-limit.util';
import { parseMemberFirstScriptReply } from 'src/engine/core-modules/usage-limit/utils/parse-member-first-script-reply.util';
import { selectMemberFirstExhaustedCounters } from 'src/engine/core-modules/usage-limit/utils/select-member-first-exhausted-counters.util';
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
  // Member path only: workspace-path sites also count limit degradations, so a counter kind there would mislabel them
  counterKind?: MemberAllowanceQuotaCounter['kind'];
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

type CreditCounters = {
  allowanceCounter: AllowanceQuotaCounter | null;
  memberCounter: MemberAllowanceQuotaCounter | null;
};

type CreditCounterEvent = Pick<
  RecordUsageInput,
  'resourceType' | 'operationType' | 'spenders'
>;

type QuotaAdmissionArgs = QuotaConsumeArgs & {
  cost?: QuotaCost;
  memberCreditsPayer?: MemberCreditsPayer;
};

const QUOTA_ADMISSION_WITHOUT_MEMBER_COUNTER: QuotaAdmission = {
  exhaustedScope: null,
  hasMemberCounter: false,
  isMemberAllowanceAvailable: null,
  isWorkspaceAllowanceAvailable: null,
};

type MemberFirstScriptAttempt =
  | Exclude<MemberFirstConsumeResult, { outcome: 'applied' }>
  | {
      outcome: 'ran';
      reply: ReturnType<typeof parseMemberFirstScriptReply>;
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
    requireMemberCounter = false,
    ...args
  }: QuotaAdmissionArgs & {
    requireMemberCounter?: boolean;
  }): Promise<QuotaAdmission> {
    const enforcement: QuotaEnforcement = {
      operation: 'assert',
      resourceType: args.resourceType,
    };

    try {
      return await this.findAdmissionFromCounters({
        ...args,
        requireMemberCounter,
        enforcement,
      });
    } catch (error) {
      return this.admitOnFailure({
        error,
        workspaceId: args.workspaceId,
        enforcement,
        admitted: QUOTA_ADMISSION_WITHOUT_MEMBER_COUNTER,
      });
    }
  }

  async charge({
    workspaceId,
    events,
    memberCreditsPayer,
  }: {
    workspaceId: string;
    events: RecordUsageInput[];
    memberCreditsPayer?: MemberCreditsPayer;
  }): Promise<
    Pick<QuotaDebitResult, 'exhaustedKind' | 'memberCreditsUsedMicro'>
  > {
    if (events.length === 0) {
      return { exhaustedKind: null, memberCreditsUsedMicro: 0 };
    }

    const { exhaustedKind, memberCreditsUsedMicro } =
      await this.debitCountersAdmittingOnFailure({
        workspaceId,
        events,
        memberCreditsPayer,
      });

    await this.usageRecorderService.record(
      workspaceId,
      apportionMemberCredits({ events, memberCreditsUsedMicro }),
    );

    return { exhaustedKind, memberCreditsUsedMicro };
  }

  async debitAheadOfRecord({
    workspaceId,
    event,
    memberCreditsPayer,
  }: {
    workspaceId: string;
    event: RecordUsageInput;
    memberCreditsPayer?: MemberCreditsPayer;
  }): Promise<QuotaDebitResult> {
    return this.debitCountersAdmittingOnFailure({
      workspaceId,
      events: [event],
      memberCreditsPayer,
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
        (await this.getWorkspaceFundedCreditsUsedMicro({
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

  async getMemberAllowanceUsage({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<{
    limitValue: number;
    consumedValue: number | null;
    periodEnd: Date;
    fallback: MemberCreditsFallbackMode;
  } | null> {
    const { memberCounter } = await this.buildCreditCounters({
      workspaceId,
      events: [],
      memberCreditsPayer: { userWorkspaceId },
    });

    if (!isDefined(memberCounter)) {
      return null;
    }

    const {
      consumedValues: [consumedValue],
    } = await this.readCountersAdmittingOnFailure({
      workspaceId,
      counters: [memberCounter],
    });

    return {
      limitValue: memberCounter.limitValue,
      consumedValue: consumedValue ?? null,
      periodEnd: memberCounter.periodEnd,
      fallback: memberCounter.fallback,
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

  private async findAdmissionFromCounters({
    cost,
    memberCreditsPayer,
    requireMemberCounter,
    enforcement,
    ...args
  }: QuotaAdmissionArgs & {
    requireMemberCounter: boolean;
    enforcement: QuotaEnforcement;
  }): Promise<QuotaAdmission> {
    const { workspaceId, resourceType, operationType, spenders } = args;

    const creditCountersBuild = this.buildCreditCountersAdmittingOnFailure({
      workspaceId,
      events: [{ resourceType, operationType, spenders }],
      memberCreditsPayer,
    });

    if (requireMemberCounter) {
      const { memberCounter } = await creditCountersBuild;

      if (!isDefined(memberCounter)) {
        return QUOTA_ADMISSION_WITHOUT_MEMBER_COUNTER;
      }
    }

    const [
      limitCounters,
      { allowanceCounter, memberCounter, isAllowanceSkipped },
    ] = await Promise.all([this.buildLimitCounters(args), creditCountersBuild]);

    const counters: QuotaCounter[] = [
      ...limitCounters,
      ...(isDefined(allowanceCounter) ? [allowanceCounter] : []),
    ];

    // Separate reads: one shared warm would let a failed member read blind a cold allowance or limit, and the reverse
    const [{ consumedValues, isDegraded }, memberConsumed] = await Promise.all([
      this.readCountersAdmittingOnFailure({ workspaceId, counters }),
      isDefined(memberCounter)
        ? this.readMemberCounterAdmittingOnFailure({
            workspaceId,
            resourceType,
            memberCounter,
          })
        : null,
    ]);

    if (isDegraded || isAllowanceSkipped) {
      this.countAdmitOnFailure(enforcement);
    }

    const { exhaustedCounters, ...memberAdmission } =
      selectMemberFirstExhaustedCounters({
        exhaustedCounters: findExhaustedCounters({
          counters: isDefined(memberCounter)
            ? [...counters, memberCounter]
            : counters,
          consumedValues: [...consumedValues, memberConsumed],
          cost,
        }),
        memberCounter,
        memberConsumed,
        allowanceConsumed: isDefined(allowanceCounter)
          ? (consumedValues[counters.indexOf(allowanceCounter)] ?? null)
          : null,
      });

    const exhaustedScopes = exhaustedCounters.map((counter) =>
      buildQuotaExhaustedScope({ resourceType, counter }),
    );

    const exhaustedScope =
      exhaustedScopes.find((scope) => scope.exhaustedKind === 'allowance') ??
      exhaustedScopes.find(
        (scope) => scope.exhaustedKind === 'memberAllowance',
      ) ??
      exhaustedScopes[0] ??
      null;

    if (
      isDefined(memberCounter) &&
      exhaustedScope?.exhaustedKind === 'memberAllowance'
    ) {
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.UsageLimitQuotaMemberAllowanceRefused,
        amount: 1,
        attributes: {
          fallback: memberCounter.fallback,
          phase: requireMemberCounter ? 'worker' : 'preflight',
        },
      });
    }

    return { exhaustedScope, ...memberAdmission };
  }

  private async readMemberCounterAdmittingOnFailure({
    workspaceId,
    resourceType,
    memberCounter,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
    memberCounter: MemberAllowanceQuotaCounter;
  }): Promise<number | null> {
    const {
      consumedValues: [memberConsumed],
      isDegraded,
    } = await this.readCountersAdmittingOnFailure({
      workspaceId,
      counters: [memberCounter],
    });

    if (isDegraded) {
      this.countAdmitOnFailure({
        operation: 'assert',
        resourceType,
        counterKind: memberCounter.kind,
      });
    }

    return memberConsumed ?? null;
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
    memberCreditsPayer,
  }: {
    workspaceId: string;
    events: RecordUsageInput[];
    memberCreditsPayer?: MemberCreditsPayer;
  }): Promise<QuotaDebitResult> {
    try {
      const [
        limitCounters,
        { allowanceCounter, memberCounter, isAllowanceSkipped },
      ] = await Promise.all([
        this.buildLimitCountersForEvents({ workspaceId, events }),
        this.buildCreditCountersAdmittingOnFailure({
          workspaceId,
          events,
          memberCreditsPayer,
        }),
      ]);

      const amount = computeAllowanceDebitAmount({ events });

      if (isDefined(memberCounter) && amount > 0) {
        return await this.debitMemberFirst({
          workspaceId,
          events,
          limitCounters,
          allowanceCounter,
          memberCounter,
          amount,
        });
      }

      return {
        exhaustedKind: await this.debitWorkspaceFundedCounters({
          workspaceId,
          events,
          counters: [
            ...limitCounters,
            ...(isDefined(allowanceCounter) ? [allowanceCounter] : []),
          ],
          isAllowanceSkipped,
        }),
        memberCreditsUsedMicro: 0,
        isMemberAllowanceExhausted: false,
        memberAllowancePeriodEnd: memberCounter?.periodEnd ?? null,
      };
    } catch (error) {
      this.logger.error(
        `Usage quota debit degraded for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      this.countConsumeAdmittedOnFailure({
        events,
        isAllowanceUnmetered: true,
      });

      return {
        exhaustedKind: null,
        memberCreditsUsedMicro: 0,
        isMemberAllowanceExhausted: false,
        memberAllowancePeriodEnd: null,
      };
    }
  }

  private async debitWorkspaceFundedCounters({
    workspaceId,
    events,
    counters: candidateCounters,
    isAllowanceSkipped,
  }: {
    workspaceId: string;
    events: RecordUsageInput[];
    counters: QuotaCounter[];
    isAllowanceSkipped: boolean;
  }): Promise<ExhaustedKind | null> {
    const debits = buildQuotaDebits({ counters: candidateCounters, events });

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
  }

  private async debitMemberFirst({
    workspaceId,
    events,
    limitCounters,
    allowanceCounter,
    memberCounter,
    amount,
  }: {
    workspaceId: string;
    events: RecordUsageInput[];
    limitCounters: LimitQuotaCounter[];
    allowanceCounter: AllowanceQuotaCounter | null;
    memberCounter: MemberAllowanceQuotaCounter;
    amount: number;
  }): Promise<QuotaDebitResult> {
    const limitDebits = buildQuotaDebits({ counters: limitCounters, events });

    const [limitConsumedValues, memberFirstConsume] = await Promise.all([
      this.consumeLimitDebitsAdmittingOnFailure({
        workspaceId,
        events,
        debits: limitDebits,
      }),
      this.consumeMemberFirst({
        workspaceId,
        memberCounter,
        allowanceCounter,
        amount,
      }),
    ]);

    const { memberConsumed, allowanceConsumed, memberCreditsUsedMicro } =
      await this.settleMemberFirstConsume({
        workspaceId,
        events,
        allowanceCounter,
        memberCounter,
        amount,
        memberFirstConsume,
      });

    return {
      exhaustedKind: findMemberFirstExhaustedKind({
        outcome: memberFirstConsume.outcome,
        fallback: memberCounter.fallback,
        memberConsumed,
        memberLimitValue: memberCounter.limitValue,
        allowanceConsumed,
        allowanceLimitValue: allowanceCounter?.limitValue ?? null,
        hasExhaustedLimitCounter:
          findExhaustedCounters({
            counters: limitDebits.map((debit) => debit.counter),
            consumedValues: limitConsumedValues,
          }).length > 0,
      }),
      memberCreditsUsedMicro,
      isMemberAllowanceExhausted:
        isDefined(memberConsumed) && memberConsumed >= memberCounter.limitValue,
      memberAllowancePeriodEnd: memberCounter.periodEnd,
    };
  }

  private async settleMemberFirstConsume({
    workspaceId,
    events,
    allowanceCounter,
    memberCounter,
    amount,
    memberFirstConsume,
  }: {
    workspaceId: string;
    events: RecordUsageInput[];
    allowanceCounter: AllowanceQuotaCounter | null;
    memberCounter: MemberAllowanceQuotaCounter;
    amount: number;
    memberFirstConsume: MemberFirstConsumeResult;
  }): Promise<{
    memberConsumed: number | null;
    allowanceConsumed: number | null;
    memberCreditsUsedMicro: number;
  }> {
    const [{ resourceType }] = events;

    switch (memberFirstConsume.outcome) {
      case 'applied': {
        const { memberShare, memberConsumed, allowanceConsumed } =
          memberFirstConsume;

        if (memberFirstConsume.isAllowanceUnmetered) {
          this.countAdmitOnFailure({
            operation: 'consume',
            resourceType,
            creditsUsedMicro: amount - memberShare,
          });
        }

        this.countMemberCreditsApplied({
          events,
          memberCounter,
          memberShare,
          memberConsumed,
        });

        return {
          memberConsumed,
          allowanceConsumed,
          memberCreditsUsedMicro: memberShare,
        };
      }
      case 'memberUnavailable': {
        const allowanceConsumed = await this.consumeAllowanceAdmittingOnFailure(
          { workspaceId, allowanceCounter, amount },
        );

        this.countAdmitOnFailure({
          operation: 'consume',
          resourceType,
          counterKind: memberCounter.kind,
          creditsUsedMicro: isDefined(allowanceConsumed) ? 0 : amount,
        });

        return {
          memberConsumed: null,
          allowanceConsumed,
          memberCreditsUsedMicro: 0,
        };
      }
      // No re-route to the allowance: the script may have run, so a re-route could debit twice
      case 'unknown':
        this.countAdmitOnFailure({
          operation: 'consume',
          resourceType,
          counterKind: memberCounter.kind,
          creditsUsedMicro: amount,
        });

        return {
          memberConsumed: null,
          allowanceConsumed: null,
          memberCreditsUsedMicro: 0,
        };
      default:
        return assertUnreachable(memberFirstConsume);
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
          isAllowanceUnmetered: false,
        });
      }

      return consumedValues;
    } catch (error) {
      this.logger.error(
        `Usage quota limit debit degraded for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      this.countConsumeAdmittedOnFailure({
        events,
        isAllowanceUnmetered: false,
      });

      return debits.map(() => null);
    }
  }

  private async consumeAllowanceAdmittingOnFailure({
    workspaceId,
    allowanceCounter,
    amount,
  }: {
    workspaceId: string;
    allowanceCounter: AllowanceQuotaCounter | null;
    amount: number;
  }): Promise<number | null> {
    if (!isDefined(allowanceCounter)) {
      return null;
    }

    try {
      const {
        consumedValues: [allowanceConsumed],
      } = await this.consumeCounters({
        workspaceId,
        counters: [allowanceCounter],
        amounts: [amount],
      });

      return allowanceConsumed ?? null;
    } catch (error) {
      this.logger.error(
        `Usage quota allowance debit degraded for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return null;
    }
  }

  private async consumeMemberFirst({
    workspaceId,
    memberCounter,
    allowanceCounter,
    amount,
  }: {
    workspaceId: string;
    memberCounter: MemberAllowanceQuotaCounter;
    allowanceCounter: AllowanceQuotaCounter | null;
    amount: number;
  }): Promise<MemberFirstConsumeResult> {
    const scriptAllowanceCounter =
      memberCounter.fallback === 'WORKSPACE_CREDITS' ? allowanceCounter : null;
    const counters = isDefined(scriptAllowanceCounter)
      ? [memberCounter, scriptAllowanceCounter]
      : [memberCounter];

    const firstAttempt = await this.attemptMemberFirstScript({
      workspaceId,
      counters,
      memberCounter,
      amount,
      warms: counters.map(() => null),
    });

    if (firstAttempt.outcome !== 'ran') {
      return firstAttempt;
    }

    const { reply: firstReply } = firstAttempt;

    if (firstReply.memberShare !== null) {
      return {
        outcome: 'applied',
        memberShare: firstReply.memberShare,
        memberConsumed: firstReply.memberConsumed,
        allowanceConsumed: firstReply.allowanceConsumed,
        isAllowanceUnmetered: false,
      };
    }

    const isMemberCold = !isDefined(firstReply.memberConsumed);
    const isAllowanceCold =
      isDefined(scriptAllowanceCounter) &&
      !isDefined(firstReply.allowanceConsumed);

    const [memberWarm, allowanceWarm] = await Promise.allSettled([
      isMemberCold
        ? this.fetchWarmValue({ workspaceId, counter: memberCounter })
        : null,
      isAllowanceCold
        ? this.fetchWarmValue({ workspaceId, counter: scriptAllowanceCounter })
        : null,
    ]);

    if (memberWarm.status === 'rejected') {
      this.logger.error(
        `Member credits warm failed for workspace ${workspaceId}: ${memberWarm.reason instanceof Error ? memberWarm.reason.message : 'unknown error'}`,
      );

      return { outcome: 'memberUnavailable' };
    }

    if (allowanceWarm.status === 'rejected') {
      this.logger.error(
        `Usage quota allowance warm failed for workspace ${workspaceId}: ${allowanceWarm.reason instanceof Error ? allowanceWarm.reason.message : 'unknown error'}`,
      );
    }

    const warmedAt = Date.now();

    if (memberCounter.periodEnd.getTime() <= warmedAt) {
      return { outcome: 'memberUnavailable' };
    }

    const isAllowanceUnmetered =
      isAllowanceCold &&
      (allowanceWarm.status === 'rejected' ||
        scriptAllowanceCounter.periodEnd.getTime() <= warmedAt);
    const warmedCounters = isAllowanceUnmetered ? [memberCounter] : counters;

    const secondAttempt = await this.attemptMemberFirstScript({
      workspaceId,
      counters: warmedCounters,
      memberCounter,
      amount,
      warms: warmedCounters.map((counter) => {
        const warm =
          counter.kind === 'memberAllowance' ? memberWarm : allowanceWarm;

        return warm.status === 'fulfilled' && isDefined(warm.value)
          ? {
              value: warm.value,
              ttl: counter.periodEnd.getTime() - warmedAt,
            }
          : null;
      }),
    });

    if (secondAttempt.outcome !== 'ran') {
      return secondAttempt;
    }

    const { reply: secondReply } = secondAttempt;

    // Still cold only when a key expired between the two runs, and nothing was applied
    if (secondReply.memberShare === null) {
      return { outcome: 'memberUnavailable' };
    }

    return {
      outcome: 'applied',
      memberShare: secondReply.memberShare,
      memberConsumed: secondReply.memberConsumed,
      allowanceConsumed: secondReply.allowanceConsumed,
      isAllowanceUnmetered,
    };
  }

  private async attemptMemberFirstScript({
    workspaceId,
    counters,
    memberCounter,
    amount,
    warms,
  }: {
    workspaceId: string;
    counters: (MemberAllowanceQuotaCounter | AllowanceQuotaCounter)[];
    memberCounter: MemberAllowanceQuotaCounter;
    amount: number;
    warms: ({ value: number; ttl: number } | null)[];
  }): Promise<MemberFirstScriptAttempt> {
    let scriptArguments: string[];

    try {
      scriptArguments = buildMemberFirstScriptArguments({
        amount,
        memberLimit: memberCounter.limitValue,
        isFallbackEnabled: memberCounter.fallback === 'WORKSPACE_CREDITS',
        warms,
      });
    } catch (error) {
      this.logger.error(
        `Member credits debit skipped for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return { outcome: 'memberUnavailable' };
    }

    try {
      const reply = await this.cacheStorage.runScript<unknown>({
        script: WARM_AND_CONSUME_MEMBER_FIRST_SCRIPT,
        keys: counters.map((counter) => counter.key),
        args: scriptArguments,
      });

      return { outcome: 'ran', reply: parseMemberFirstScriptReply(reply) };
    } catch (error) {
      this.logger.error(
        `Member credits debit outcome unknown for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return { outcome: 'unknown' };
    }
  }

  private countMemberCreditsApplied({
    events,
    memberCounter,
    memberShare,
    memberConsumed,
  }: {
    events: RecordUsageInput[];
    memberCounter: MemberAllowanceQuotaCounter;
    memberShare: number;
    memberConsumed: number;
  }): void {
    for (const {
      operationType,
      memberCreditsUsedMicro,
    } of apportionMemberCredits({
      events,
      memberCreditsUsedMicro: memberShare,
    })) {
      if (memberCreditsUsedMicro > 0) {
        this.metricsService.incrementCounterBy({
          key: MetricsKeys.UsageLimitQuotaMemberCreditsUsedMicro,
          amount: memberCreditsUsedMicro,
          attributes: { operationType, fallback: memberCounter.fallback },
        });
      }
    }

    const isStopModeCrossing =
      memberCounter.fallback === 'STOP' &&
      memberConsumed - memberShare < memberCounter.limitValue &&
      memberConsumed >= memberCounter.limitValue;

    if (isStopModeCrossing) {
      this.metricsService.recordHistogram({
        key: MetricsKeys.UsageLimitQuotaMemberAllowanceStopOvershootMicro,
        value: memberConsumed - memberCounter.limitValue,
        bucketBoundaries:
          MEMBER_ALLOWANCE_STOP_OVERSHOOT_MICRO_BUCKET_BOUNDARIES,
      });
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

  private async buildCreditCountersAdmittingOnFailure({
    workspaceId,
    events,
    memberCreditsPayer,
  }: {
    workspaceId: string;
    events: CreditCounterEvent[];
    memberCreditsPayer?: MemberCreditsPayer;
  }): Promise<CreditCounters & { isAllowanceSkipped: boolean }> {
    try {
      return {
        ...(await this.buildCreditCounters({
          workspaceId,
          events,
          memberCreditsPayer,
        })),
        isAllowanceSkipped: false,
      };
    } catch (error) {
      if (error instanceof WorkspaceCacheException) {
        throw error;
      }

      this.logger.error(
        `Usage quota allowance skipped for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return {
        allowanceCounter: null,
        memberCounter: null,
        isAllowanceSkipped: true,
      };
    }
  }

  private async buildAllowanceCounter(
    workspaceId: string,
  ): Promise<AllowanceQuotaCounter | null> {
    const { allowanceCounter } = await this.buildCreditCounters({
      workspaceId,
      events: [],
    });

    return allowanceCounter;
  }

  private async buildCreditCounters({
    workspaceId,
    events,
    memberCreditsPayer,
  }: {
    workspaceId: string;
    events: CreditCounterEvent[];
    memberCreditsPayer?: MemberCreditsPayer;
  }): Promise<CreditCounters> {
    if (
      !(await this.billingCreditAllowanceService.isCreditAllowanceEnabled())
    ) {
      return { allowanceCounter: null, memberCounter: null };
    }

    const allowance =
      await this.billingCreditAllowanceService.getCreditAllowance(workspaceId);

    if (!isDefined(allowance)) {
      return { allowanceCounter: null, memberCounter: null };
    }

    return {
      allowanceCounter: {
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
      },
      memberCounter: this.buildMemberAllowanceCounter({
        workspaceId,
        memberCredits: allowance.memberCredits,
        events,
        memberCreditsPayer,
      }),
    };
  }

  private buildMemberAllowanceCounter({
    workspaceId,
    memberCredits,
    events,
    memberCreditsPayer,
  }: {
    workspaceId: string;
    memberCredits: MemberCreditsAllowance | null;
    events: CreditCounterEvent[];
    memberCreditsPayer?: MemberCreditsPayer;
  }): MemberAllowanceQuotaCounter | null {
    if (!isDefined(memberCreditsPayer) || !isDefined(memberCredits)) {
      return null;
    }

    const ineligibleEvent = events.find(
      (event) =>
        !isMemberCreditsEligibleEvent({ event, payer: memberCreditsPayer }),
    );

    if (isDefined(ineligibleEvent)) {
      this.logger.warn(
        `Member credits payer ignored for workspace ${workspaceId}: a ${ineligibleEvent.resourceType}/${ineligibleEvent.operationType} event is not member-funded`,
      );
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.UsageLimitQuotaMemberCreditsPayerIgnored,
        amount: 1,
        attributes: {
          resourceType: ineligibleEvent.resourceType,
          operationType: ineligibleEvent.operationType,
        },
      });

      return null;
    }

    return {
      kind: 'memberAllowance',
      key: buildMemberAllowanceCounterKey({
        workspaceId,
        userWorkspaceId: memberCreditsPayer.userWorkspaceId,
        periodStart: memberCredits.periodStart,
      }),
      limitValue: memberCredits.amountMicro,
      unit: UsageUnit.CREDIT,
      userWorkspaceId: memberCreditsPayer.userWorkspaceId,
      periodStart: memberCredits.periodStart,
      periodEnd: memberCredits.periodEnd,
      fallback: memberCredits.fallback,
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
          case 'allowance':
            return this.getWorkspaceFundedCreditsUsedMicro({
              workspaceId,
              counter,
            });
          case 'memberAllowance':
            return this.usageAnalyticsService.getMemberCreditsUsedMicroForSlice(
              {
                workspaceId,
                userWorkspaceId: counter.userWorkspaceId,
                sliceStart: counter.periodStart,
                sliceEnd: counter.periodEnd,
              },
            );
          case 'limit': {
            const periodGroupKey = buildPeriodGroupKey(counter);

            const rowsRead =
              rowsReadsByPeriodGroup.get(periodGroupKey) ??
              this.fetchConsumptionRows({ workspaceId, counter });

            rowsReadsByPeriodGroup.set(periodGroupKey, rowsRead);

            return computeQuotaConsumed({
              rows: await rowsRead,
              scope: counter,
            });
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

  private async getWorkspaceFundedCreditsUsedMicro({
    workspaceId,
    counter,
  }: {
    workspaceId: string;
    counter: AllowanceQuotaCounter;
  }): Promise<number> {
    const { workspaceFundedCreditsUsedMicro } =
      await this.usageAnalyticsService.getWorkspaceFundedCreditsUsedMicroForBillingPeriod(
        {
          workspaceId,
          periodStart: counter.periodStart,
          periodEnd: counter.periodEnd,
        },
      );

    return workspaceFundedCreditsUsedMicro;
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
