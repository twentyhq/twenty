import { isDefined } from 'twenty-shared/utils';

import { type QuotaCost } from 'src/engine/core-modules/usage-limit/types/quota-cost.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';

export const findExhaustedCounters = ({
  counters,
  remainings,
  cost,
}: {
  counters: QuotaCounter[];
  remainings: (number | null)[];
  cost?: QuotaCost;
}): QuotaCounter[] =>
  counters.filter((counter, index) => {
    const remaining = remainings[index];

    if (!isDefined(remaining)) {
      return false;
    }

    // A caller that names what it is about to spend is admitted only if the
    // whole of it fits, so a batch cannot straddle the limit and overshoot it.
    return remaining <= 0 || remaining < (cost?.[counter.meter] ?? 0);
  });
