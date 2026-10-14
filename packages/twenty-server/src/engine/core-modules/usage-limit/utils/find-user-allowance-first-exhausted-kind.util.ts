import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { type ExhaustedKind } from 'src/engine/core-modules/usage-limit/types/exhausted-kind.type';
import { type UserCreditsFallbackMode } from 'src/engine/core-modules/usage-limit/types/user-credits-fallback-mode.type';
import { type UserAllowanceFirstConsumeResult } from 'src/engine/core-modules/usage-limit/types/user-allowance-first-consume-result.type';
import { isLimitExhausted } from 'src/engine/core-modules/usage-limit/utils/is-limit-exhausted.util';

type UserAllowanceFirstDebit = {
  outcome: UserAllowanceFirstConsumeResult['outcome'];
  fallback: UserCreditsFallbackMode;
  userAllowanceConsumed: number | null;
  userAllowanceLimitValue: number;
  workspaceAllowanceConsumed: number | null;
  workspaceAllowanceLimitValue: number | null;
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
  userAllowanceConsumed,
  userAllowanceLimitValue,
  workspaceAllowanceConsumed,
  workspaceAllowanceLimitValue,
}: UserAllowanceFirstDebit): ExhaustedKind | null => {
  const isUserAllowanceExhausted = isConsumedAtLimit({
    consumed: userAllowanceConsumed,
    limitValue: userAllowanceLimitValue,
  });
  const isWorkspaceAllowanceExhausted = isConsumedAtLimit({
    consumed: workspaceAllowanceConsumed,
    limitValue: workspaceAllowanceLimitValue,
  });

  switch (outcome) {
    case 'applied':
      if (fallback === 'STOP') {
        return isUserAllowanceExhausted ? 'userAllowance' : null;
      }

      return isUserAllowanceExhausted && isWorkspaceAllowanceExhausted
        ? 'workspaceAllowance'
        : null;
    case 'userAllowanceUnavailable':
      return isWorkspaceAllowanceExhausted ? 'workspaceAllowance' : null;
    case 'unknown':
      return null;
    default:
      return assertUnreachable(outcome);
  }
};

export const findUserAllowanceFirstExhaustedKind = ({
  hasExhaustedLimitCounter,
  ...userAllowanceFirstDebit
}: UserAllowanceFirstDebit & {
  hasExhaustedLimitCounter: boolean;
}): ExhaustedKind | null =>
  findCreditsExhaustedKind(userAllowanceFirstDebit) ??
  (hasExhaustedLimitCounter ? 'limit' : null);
