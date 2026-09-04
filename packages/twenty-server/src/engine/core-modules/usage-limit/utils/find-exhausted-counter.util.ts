import { isDefined } from 'twenty-shared/utils';

import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';

export const findExhaustedCounter = ({
  counters,
  remainings,
}: {
  counters: QuotaCounter[];
  remainings: (number | null)[];
}): QuotaCounter | null => {
  const exhaustedIndex = remainings.findIndex(
    (remaining) => isDefined(remaining) && remaining <= 0,
  );

  return exhaustedIndex === -1 ? null : counters[exhaustedIndex];
};
