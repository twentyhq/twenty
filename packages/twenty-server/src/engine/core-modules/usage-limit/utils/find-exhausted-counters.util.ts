import { isDefined } from 'twenty-shared/utils';

import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';

export const findExhaustedCounters = ({
  counters,
  remainings,
}: {
  counters: QuotaCounter[];
  remainings: (number | null)[];
}): QuotaCounter[] =>
  counters.filter((_, index) => {
    const remaining = remainings[index];

    return isDefined(remaining) && remaining <= 0;
  });
