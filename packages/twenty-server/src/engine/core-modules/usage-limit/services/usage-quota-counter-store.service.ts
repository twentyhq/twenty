import { Injectable, Logger } from '@nestjs/common';

import {
  assertUnreachable,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { WARM_AND_CONSUME_COUNTERS_SCRIPT } from 'src/engine/core-modules/usage-limit/constants/warm-and-consume-counters-script.constant';
import { WARM_AND_CONSUME_USER_ALLOWANCE_FIRST_SCRIPT } from 'src/engine/core-modules/usage-limit/constants/warm-and-consume-user-allowance-first-script.constant';
import { UsageLimitException } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsagePeriodService } from 'src/engine/core-modules/usage-limit/services/usage-period.service';
import { type WorkspaceAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/workspace-allowance-quota-counter.type';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type UserAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/user-allowance-quota-counter.type';
import { type UserAllowanceFirstConsumeResult } from 'src/engine/core-modules/usage-limit/types/user-allowance-first-consume-result.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { buildConsumeScriptArguments } from 'src/engine/core-modules/usage-limit/utils/build-consume-script-arguments.util';
import { buildIntraWorkspaceLimitCounterKeys } from 'src/engine/core-modules/usage-limit/utils/build-intra-workspace-limit-counter-keys.util';
import { buildLimitQuotaCounter } from 'src/engine/core-modules/usage-limit/utils/build-limit-quota-counter.util';
import { buildUserAllowanceFirstScriptArguments } from 'src/engine/core-modules/usage-limit/utils/build-user-allowance-first-script-arguments.util';
import { buildPeriodGroupKey } from 'src/engine/core-modules/usage-limit/utils/build-period-group-key.util';
import { computeQuotaConsumed } from 'src/engine/core-modules/usage-limit/utils/compute-quota-consumed.util';
import { findSuppressedUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/utils/find-suppressed-usage-limit-defaults.util';
import { isQuotaLimit } from 'src/engine/core-modules/usage-limit/utils/is-quota-limit.util';
import { isWorkspaceCreditLimitCounter } from 'src/engine/core-modules/usage-limit/utils/is-workspace-credit-limit-counter.util';
import { parseUserAllowanceFirstScriptReply } from 'src/engine/core-modules/usage-limit/utils/parse-user-allowance-first-script-reply.util';
import { getPeriodAnchor } from 'src/engine/core-modules/usage-limit/utils/get-period-anchor.util';
import { UsageAnalyticsService } from 'src/engine/core-modules/usage/services/usage-analytics.service';
import { type UsageConsumptionRow } from 'src/engine/core-modules/usage/types/usage-consumption-row.type';
import { WorkspaceCacheException } from 'src/engine/workspace-cache/exceptions/workspace-cache.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type QuotaEnforcement } from 'src/engine/core-modules/usage-limit/types/quota-enforcement.type';

type QuotaConsumeResult = {
  consumedValues: (number | null)[];
  isDegraded: boolean;
};

type UserAllowanceFirstScriptAttempt =
  | Exclude<UserAllowanceFirstConsumeResult, { outcome: 'applied' }>
  | {
      outcome: 'ran';
      reply: ReturnType<typeof parseUserAllowanceFirstScriptReply>;
    };

@Injectable()
export class UsageQuotaCounterStoreService {
  private readonly logger = new Logger(UsageQuotaCounterStoreService.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineUsageLimit)
    private readonly cacheStorage: CacheStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly usagePeriodService: UsagePeriodService,
    private readonly usageAnalyticsService: UsageAnalyticsService,
    private readonly metricsService: MetricsService,
  ) {}

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

  async readCountersAdmittingOnFailure({
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

  async consumeUserAllowanceFirst({
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

    const [userAllowanceWarms, workspaceAllowanceWarms] =
      await Promise.allSettled([
        this.fetchWarms({ workspaceId, counters: coldUserAllowanceCounters }),
        this.fetchWarms({
          workspaceId,
          counters: isWorkspaceAllowanceCold
            ? [scriptWorkspaceAllowanceCounter]
            : [],
        }),
      ]);

    if (userAllowanceWarms.status === 'rejected') {
      this.logger.error(
        `User credits warm failed for workspace ${workspaceId}: ${userAllowanceWarms.reason instanceof Error ? userAllowanceWarms.reason.message : 'unknown error'}`,
      );

      return { outcome: 'userAllowanceUnavailable' };
    }

    if (workspaceAllowanceWarms.status === 'rejected') {
      this.logger.error(
        `Usage quota allowance warm failed for workspace ${workspaceId}: ${workspaceAllowanceWarms.reason instanceof Error ? workspaceAllowanceWarms.reason.message : 'unknown error'}`,
      );
    }

    if (
      userAllowanceCounters.some(
        (counter) => counter.periodEnd.getTime() <= Date.now(),
      )
    ) {
      return { outcome: 'userAllowanceUnavailable' };
    }

    const warmByKey = new Map([
      ...userAllowanceWarms.value,
      ...(workspaceAllowanceWarms.status === 'fulfilled'
        ? workspaceAllowanceWarms.value
        : []),
    ]);

    const isWorkspaceAllowanceUnmetered =
      isWorkspaceAllowanceCold &&
      !warmByKey.has(scriptWorkspaceAllowanceCounter.key);
    const warmedCounters = isWorkspaceAllowanceUnmetered
      ? userAllowanceCounters
      : counters;

    const secondAttempt = await this.attemptUserAllowanceFirstScript({
      workspaceId,
      counters: warmedCounters,
      userAllowanceCounters,
      amount,
      warms: warmedCounters.map(
        (counter) => warmByKey.get(counter.key) ?? null,
      ),
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

  admitOnFailure<TAdmitted>({
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

  countAdmitOnFailure({
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

  async consumeCounters({
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
      const warmByKey = await this.fetchWarms({
        workspaceId,
        counters: coldIndexes.map((index) => counters[index]),
      });

      const warmedIndexes = coldIndexes.filter((index) =>
        warmByKey.has(counters[index].key),
      );

      const warmedValues = await this.runWarmAndConsumeScript({
        counters: warmedIndexes.map((index) => counters[index]),
        entries: warmedIndexes.map((index) => ({
          amount: amounts[index],
          warm: warmByKey.get(counters[index].key) ?? null,
        })),
      });

      warmedIndexes.forEach((index, position) => {
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

  private async findAllLimits(workspaceId: string): Promise<FlatUsageLimit[]> {
    const { usageLimits } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['usageLimits'],
    );

    return Object.values(usageLimits.byResourceType).flatMap(
      (limits) => limits ?? [],
    );
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
              operationTypes: counter.operationTypes,
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
                      operationTypes: counter.operationTypes,
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

  private async fetchWarms({
    workspaceId,
    counters,
  }: {
    workspaceId: string;
    counters: QuotaCounter[];
  }): Promise<Map<string, { value: number; ttl: number }>> {
    const warmValues = await this.fetchWarmValues({ workspaceId, counters });
    const warmedAt = Date.now();

    return new Map(
      counters.flatMap((counter, index) =>
        counter.periodEnd.getTime() > warmedAt
          ? [
              [
                counter.key,
                {
                  value: warmValues[index],
                  ttl: counter.periodEnd.getTime() - warmedAt,
                },
              ] as const,
            ]
          : [],
      ),
    );
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
