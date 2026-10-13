import { isDefined } from 'twenty-shared/utils';

import { type CreditCounterCheck } from 'src/engine/core-modules/usage-limit/types/credit-counter-check.type';
import { type MemberCreditsAllowance } from 'src/engine/core-modules/usage-limit/types/member-credits-allowance.type';

export const buildCreditCounterCheck = ({
  key,
  liveValueMicro,
  rebuiltValueMicro,
  turnCostMicro,
  memberCredits,
}: {
  key: string;
  liveValueMicro: number | null;
  rebuiltValueMicro: number;
  turnCostMicro: number;
  memberCredits?: Pick<MemberCreditsAllowance, 'amountMicro' | 'fallback'>;
}): CreditCounterCheck => {
  const driftMicro = isDefined(liveValueMicro)
    ? liveValueMicro - rebuiltValueMicro
    : null;

  return {
    key,
    liveValueMicro,
    rebuiltValueMicro,
    driftMicro,
    isDrifted: isDefined(driftMicro) && Math.abs(driftMicro) > turnCostMicro,
    // In STOP mode the overshoot lands on the member, so only spill mode bounds the slice sum by M
    isOverrun:
      memberCredits?.fallback === 'WORKSPACE_CREDITS' &&
      rebuiltValueMicro > memberCredits.amountMicro + turnCostMicro,
  };
};
