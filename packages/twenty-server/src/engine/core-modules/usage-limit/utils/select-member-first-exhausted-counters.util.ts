import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { type MemberAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/member-allowance-quota-counter.type';
import { type QuotaAdmission } from 'src/engine/core-modules/usage-limit/types/quota-admission.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { isWorkspaceCreditLimitCounter } from 'src/engine/core-modules/usage-limit/utils/is-workspace-credit-limit-counter.util';

export const selectMemberFirstExhaustedCounters = ({
  exhaustedCounters,
  memberCounter,
  memberConsumed,
  allowanceConsumed,
}: {
  exhaustedCounters: QuotaCounter[];
  memberCounter: MemberAllowanceQuotaCounter | null;
  memberConsumed: number | null;
  allowanceConsumed: number | null;
}): Omit<QuotaAdmission, 'exhaustedScope'> & {
  exhaustedCounters: QuotaCounter[];
} => {
  if (!isDefined(memberCounter)) {
    return {
      exhaustedCounters,
      hasMemberCounter: false,
      isMemberAllowanceAvailable: null,
      isWorkspaceAllowanceAvailable: null,
    };
  }

  const isMemberRead = isDefined(memberConsumed);
  const isMemberExhausted = exhaustedCounters.some(
    (counter) => counter.kind === 'memberAllowance',
  );
  const isAllowanceExhausted = exhaustedCounters.some(
    (counter) => counter.kind === 'allowance',
  );

  // An unreadable member counter gates the operation like a workspace-funded one, the way its debit would be funded
  const isWorkspaceFunded =
    !isMemberRead ||
    (memberCounter.fallback === 'WORKSPACE_CREDITS' && isMemberExhausted);

  const selectedExhaustedCounters = exhaustedCounters.filter((counter) => {
    switch (counter.kind) {
      case 'limit':
        return isWorkspaceCreditLimitCounter(counter)
          ? isWorkspaceFunded
          : true;
      case 'allowance':
        return isWorkspaceFunded;
      case 'memberAllowance':
        return memberCounter.fallback === 'STOP';
      default:
        return assertUnreachable(counter);
    }
  });

  const isMemberAllowanceAvailable = isMemberRead && !isMemberExhausted;

  return {
    exhaustedCounters: selectedExhaustedCounters,
    hasMemberCounter: true,
    isMemberAllowanceAvailable,
    isWorkspaceAllowanceAvailable:
      selectedExhaustedCounters.length > 0
        ? null
        : !(
            isMemberAllowanceAvailable &&
            (!isDefined(allowanceConsumed) || isAllowanceExhausted)
          ),
  };
};
