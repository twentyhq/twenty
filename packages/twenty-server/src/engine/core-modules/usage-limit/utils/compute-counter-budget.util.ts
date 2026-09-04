import { isDefined } from 'twenty-shared/utils';

import { type CreditAllowance } from 'src/engine/core-modules/usage-limit/types/credit-allowance.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';

export const computeCounterBudget = ({
  counter,
  allowance,
}: {
  counter: LimitQuotaCounter;
  allowance: CreditAllowance | null;
}): number | null => {
  if (counter.limitValueType === 'absolute') {
    return counter.limitValue;
  }

  if (
    !isDefined(allowance) ||
    allowance.periodStart.getTime() !== counter.periodStart.getTime()
  ) {
    return null;
  }

  return Math.floor((allowance.allowanceMicro * counter.limitValue) / 100);
};
