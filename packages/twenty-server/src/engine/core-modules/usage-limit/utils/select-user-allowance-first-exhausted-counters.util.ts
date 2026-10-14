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
  if (!isDefined(userAllowanceCounter)) {
    return {
      exhaustedCounters,
      hasUserAllowanceCounter: false,
      isUserAllowanceAvailable: null,
      isWorkspaceAllowanceAvailable: null,
    };
  }

  const isUserAllowanceRead = isDefined(userAllowanceConsumed);
  const isUserAllowanceExhausted = exhaustedCounters.some(
    (counter) => counter.kind === 'userAllowance',
  );
  const isWorkspaceAllowanceExhausted = exhaustedCounters.some(
    (counter) => counter.kind === 'workspaceAllowance',
  );

  // An unreadable user allowance counter gates the operation like a workspace credits one, the way its debit would be funded
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

  const isUserAllowanceAvailable =
    isUserAllowanceRead && !isUserAllowanceExhausted;

  return {
    exhaustedCounters: selectedExhaustedCounters,
    hasUserAllowanceCounter: true,
    isUserAllowanceAvailable,
    isWorkspaceAllowanceAvailable:
      selectedExhaustedCounters.length > 0
        ? null
        : !(
            isUserAllowanceAvailable &&
            (!isDefined(workspaceAllowanceConsumed) ||
              isWorkspaceAllowanceExhausted)
          ),
  };
};
