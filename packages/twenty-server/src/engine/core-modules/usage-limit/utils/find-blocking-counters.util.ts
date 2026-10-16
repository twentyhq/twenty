import { isDefined } from 'twenty-shared/utils';

import { UserCreditsFallback } from 'src/engine/core-modules/billing/enums/billing-user-credits-fallback.enum';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { isWorkspaceCreditLimitCounter } from 'src/engine/core-modules/usage-limit/utils/is-workspace-credit-limit-counter.util';

const PRIORITY_BY_KIND: Record<QuotaCounter['kind'], number> = {
  workspaceAllowance: 0,
  userAllowance: 1,
  limit: 2,
};

export const findBlockingCounters = ({
  counters,
  consumedValues,
  exhaustedCounters,
  userCreditsFallback,
}: {
  counters: QuotaCounter[];
  consumedValues: (number | null)[];
  exhaustedCounters: QuotaCounter[];
  userCreditsFallback: UserCreditsFallback;
}): QuotaCounter[] => {
  const isStopMode = userCreditsFallback === UserCreditsFallback.STOP;
  const userAllowanceIndexes = counters.flatMap((counter, index) =>
    counter.kind === 'userAllowance' ? [index] : [],
  );

  const isSpendingUserCredits =
    userAllowanceIndexes.length > 0 &&
    userAllowanceIndexes.every((index) => isDefined(consumedValues[index])) &&
    (isStopMode ||
      !exhaustedCounters.some((counter) => counter.kind === 'userAllowance'));

  return exhaustedCounters
    .filter((counter) => {
      if (counter.kind === 'userAllowance') {
        return isStopMode;
      }

      return counter.kind === 'workspaceAllowance' ||
        isWorkspaceCreditLimitCounter(counter)
        ? !isSpendingUserCredits
        : true;
    })
    .sort(
      (first, second) =>
        PRIORITY_BY_KIND[first.kind] - PRIORITY_BY_KIND[second.kind] ||
        (first.kind === 'userAllowance'
          ? second.periodEnd.getTime() - first.periodEnd.getTime()
          : 0),
    );
};
