import { isDefined } from 'twenty-shared/utils';

import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { isValidCreditAmountMicro } from 'src/engine/core-modules/usage/utils/is-valid-credit-amount-micro.util';
import { type QuotaCost } from 'src/engine/core-modules/usage-limit/types/quota-cost.type';

const clampAmount = (amount: number): number =>
  isValidCreditAmountMicro(amount) ? amount : 0;

export const clampQuotaCost = (cost: QuotaCost): QuotaCost =>
  Object.values(UsageUnit).reduce<QuotaCost>(
    (clampedCost, unit) => {
      const amount = cost[unit];

      return isDefined(amount)
        ? { ...clampedCost, [unit]: clampAmount(amount) }
        : clampedCost;
    },
    { [UsageUnit.CREDIT]: clampAmount(cost[UsageUnit.CREDIT]) },
  );
