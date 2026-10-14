import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { type UserAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/user-allowance-quota-counter.type';
import { type QuotaAdmission } from 'src/engine/core-modules/usage-limit/types/quota-admission.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { isWorkspaceCreditLimitCounter } from 'src/engine/core-modules/usage-limit/utils/is-workspace-credit-limit-counter.util';

export const selectUserAllowanceFirstExhaustedCounters = ({
  exhaustedCounters,
  userAllowanceCounter,
  userAllowanceConsumed,
  workspaceAllowanceConsumed,
}: {
  exhaustedCounters: QuotaCounter[];
  userAllowanceCounter: UserAllowanceQuotaCounter | null;
  userAllowanceConsumed: number | null;
  workspaceAllowanceConsumed: number | null;
}): Omit<QuotaAdmission, 'exhaustedScope'> & {
  exhaustedCounters: QuotaCounter[];
} => {
  const isWorkspaceAllowanceExhausted = exhaustedCounters.some(
    (counter) => counter.kind === 'workspaceAllowance',
  );

  if (!isDefined(userAllowanceCounter)) {
    return {
      exhaustedCounters,
      hasUserAllowanceCounter: false,
      hasUserCreditsLeft: false,
      hasWorkspaceCreditsLeft: !isWorkspaceAllowanceExhausted,
    };
  }

  const isUserAllowanceRead = isDefined(userAllowanceConsumed);
  const isUserAllowanceExhausted = exhaustedCounters.some(
    (counter) => counter.kind === 'userAllowance',
  );

  const isPaidWithWorkspaceCredits =
    !isUserAllowanceRead ||
    (userAllowanceCounter.fallback === 'WORKSPACE_CREDITS' &&
      isUserAllowanceExhausted);

  const selectedExhaustedCounters = exhaustedCounters.filter((counter) => {
    switch (counter.kind) {
      case 'limit':
        return isWorkspaceCreditLimitCounter(counter)
          ? isPaidWithWorkspaceCredits
          : true;
      case 'workspaceAllowance':
        return isPaidWithWorkspaceCredits;
      case 'userAllowance':
        return userAllowanceCounter.fallback === 'STOP';
      default:
        return assertUnreachable(counter);
    }
  });

  return {
    exhaustedCounters: selectedExhaustedCounters,
    hasUserAllowanceCounter: true,
    hasUserCreditsLeft: isUserAllowanceRead && !isUserAllowanceExhausted,
    hasWorkspaceCreditsLeft:
      !isWorkspaceAllowanceExhausted &&
      (isPaidWithWorkspaceCredits || isDefined(workspaceAllowanceConsumed)),
  };
};
