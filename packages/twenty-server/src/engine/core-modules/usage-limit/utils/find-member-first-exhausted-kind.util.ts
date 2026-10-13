import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { type ExhaustedKind } from 'src/engine/core-modules/usage-limit/types/exhausted-kind.type';
import { type MemberCreditsFallbackMode } from 'src/engine/core-modules/usage-limit/types/member-credits-fallback-mode.type';
import { type MemberFirstConsumeResult } from 'src/engine/core-modules/usage-limit/types/member-first-consume-result.type';
import { isLimitExhausted } from 'src/engine/core-modules/usage-limit/utils/is-limit-exhausted.util';

type MemberFirstDebit = {
  outcome: MemberFirstConsumeResult['outcome'];
  fallback: MemberCreditsFallbackMode;
  memberConsumed: number | null;
  memberLimitValue: number;
  allowanceConsumed: number | null;
  allowanceLimitValue: number | null;
};

const isConsumedAtLimit = ({
  consumed,
  limitValue,
}: {
  consumed: number | null;
  limitValue: number | null;
}): boolean =>
  isDefined(consumed) &&
  isDefined(limitValue) &&
  isLimitExhausted({ consumed, cost: 0, limitValue });

const findCreditsExhaustedKind = ({
  outcome,
  fallback,
  memberConsumed,
  memberLimitValue,
  allowanceConsumed,
  allowanceLimitValue,
}: MemberFirstDebit): ExhaustedKind | null => {
  const isMemberExhausted = isConsumedAtLimit({
    consumed: memberConsumed,
    limitValue: memberLimitValue,
  });
  const isAllowanceExhausted = isConsumedAtLimit({
    consumed: allowanceConsumed,
    limitValue: allowanceLimitValue,
  });

  switch (outcome) {
    case 'applied':
      if (fallback === 'STOP') {
        return isMemberExhausted ? 'memberAllowance' : null;
      }

      return isMemberExhausted && isAllowanceExhausted ? 'allowance' : null;
    case 'memberUnavailable':
      return isAllowanceExhausted ? 'allowance' : null;
    // The script may have run or not, so no counter value can be trusted
    case 'unknown':
      return null;
    default:
      return assertUnreachable(outcome);
  }
};

export const findMemberFirstExhaustedKind = ({
  hasExhaustedLimitCounter,
  ...memberFirstDebit
}: MemberFirstDebit & {
  hasExhaustedLimitCounter: boolean;
}): ExhaustedKind | null =>
  findCreditsExhaustedKind(memberFirstDebit) ??
  (hasExhaustedLimitCounter ? 'limit' : null);
