import { isDefined } from 'twenty-shared/utils';

import { type QuotaCost } from 'src/engine/core-modules/usage-limit/types/quota-cost.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { isLimitExhausted } from 'src/engine/core-modules/usage-limit/utils/is-limit-exhausted.util';

export const findExhaustedCounters = ({
  counters,
  consumedValues,
  cost,
}: {
  counters: QuotaCounter[];
  consumedValues: (number | null)[];
  cost?: QuotaCost;
}): QuotaCounter[] =>
  counters.filter((counter, index) => {
    const consumed = consumedValues[index];

    if (
      !isDefined(consumed) ||
      (counter.kind === 'limit' && !counter.isEnforced)
    ) {
      return false;
    }

    return isLimitExhausted({
      consumed,
      cost: cost?.[counter.unit] ?? 0,
      limitValue: counter.limitValue,
    });
  });
