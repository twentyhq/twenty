import { Injectable, Logger } from '@nestjs/common';

import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { type WorkspaceAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/workspace-allowance-quota-counter.type';
import { type ExhaustedKind } from 'src/engine/core-modules/usage-limit/types/exhausted-kind.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type UserAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/user-allowance-quota-counter.type';
import { type UserAllowanceFirstConsumeResult } from 'src/engine/core-modules/usage-limit/types/user-allowance-first-consume-result.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { type QuotaDebit } from 'src/engine/core-modules/usage-limit/types/quota-debit.type';
import { type QuotaDebitResult } from 'src/engine/core-modules/usage-limit/types/quota-debit-result.type';
import { splitUserCreditsAcrossEvents } from 'src/engine/core-modules/usage-limit/utils/split-user-credits-across-events.util';
import { buildQuotaDebits } from 'src/engine/core-modules/usage-limit/utils/build-quota-debits.util';
import { computeWorkspaceAllowanceDebitAmount } from 'src/engine/core-modules/usage-limit/utils/compute-workspace-allowance-debit-amount.util';
import { findExhaustedCounters } from 'src/engine/core-modules/usage-limit/utils/find-exhausted-counters.util';
import { findBindingUserAllowance } from 'src/engine/core-modules/usage-limit/utils/find-binding-user-allowance.util';
import { findUserAllowanceFirstExhaustedKind } from 'src/engine/core-modules/usage-limit/utils/find-user-allowance-first-exhausted-kind.util';
import { isWorkspaceCreditLimitCounter } from 'src/engine/core-modules/usage-limit/utils/is-workspace-credit-limit-counter.util';
import { subtractUserCredits } from 'src/engine/core-modules/usage-limit/utils/subtract-user-credits.util';
import { UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { fromRecordUsageInputToUsageConsumptionRow } from 'src/engine/core-modules/usage/utils/from-record-usage-input-to-usage-consumption-row.util';
import { UsageQuotaCounterBuilderService } from 'src/engine/core-modules/usage-limit/services/usage-quota-counter-builder.service';
import { UsageQuotaCounterStoreService } from 'src/engine/core-modules/usage-limit/services/usage-quota-counter-store.service';
import { type UserAllowance } from 'src/engine/core-modules/usage-limit/types/user-allowance.type';

@Injectable()
export class UsageQuotaDebitService {
  private readonly logger = new Logger(UsageQuotaDebitService.name);

  constructor(
    private readonly usageQuotaCounterBuilderService: UsageQuotaCounterBuilderService,
    private readonly usageQuotaCounterStoreService: UsageQuotaCounterStoreService,
    private readonly usageRecorderService: UsageRecorderService,
  ) {}

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
      splitUserCreditsAcrossEvents({ events, userCreditsUsedMicro }),
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
        this.usageQuotaCounterBuilderService.buildQuotaCountersForEvents({
          workspaceId,
          events,
        }),
        this.usageQuotaCounterBuilderService.buildWorkspaceAllowanceCounterAdmittingOnFailure(
          workspaceId,
        ),
      ]);

      const userAllowance =
        await this.usageQuotaCounterBuilderService.buildUserAllowance({
          workspaceId,
          userCreditCounters,
        });

      const amount = computeWorkspaceAllowanceDebitAmount({ events });

      if (isDefined(userAllowance) && amount > 0) {
        return await this.debitUserAllowanceFirst({
          workspaceId,
          events,
          limitCounters,
          workspaceAllowanceCounter,
          userAllowance,
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

    const { consumedValues, isDegraded } =
      await this.usageQuotaCounterStoreService.consumeCounters({
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
    userAllowance,
    amount,
  }: {
    workspaceId: string;
    events: RecordUsageInput[];
    limitCounters: LimitQuotaCounter[];
    workspaceAllowanceCounter: WorkspaceAllowanceQuotaCounter | null;
    userAllowance: UserAllowance;
    amount: number;
  }): Promise<QuotaDebitResult> {
    const { counters: userAllowanceCounters, fallback } = userAllowance;

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
      this.usageQuotaCounterStoreService.consumeUserAllowanceFirst({
        workspaceId,
        userAllowance,
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
          this.usageQuotaCounterStoreService.countAdmitOnFailure({
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

        this.usageQuotaCounterStoreService.countAdmitOnFailure({
          operation: 'consume',
          resourceType,
          creditsUsedMicro: isDefined(workspaceAllowanceConsumed) ? 0 : amount,
        });

        return {
          userAllowanceConsumedValues: unreadUserAllowanceConsumedValues,
          workspaceAllowanceConsumed,
          userCreditsUsedMicro: 0,
        };
      }
      case 'unknown':
        this.usageQuotaCounterStoreService.countAdmitOnFailure({
          operation: 'consume',
          resourceType,
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
      const { consumedValues, isDegraded } =
        await this.usageQuotaCounterStoreService.consumeCounters({
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
      } = await this.usageQuotaCounterStoreService.consumeCounters({
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
      this.usageQuotaCounterStoreService.countAdmitOnFailure({
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
}
