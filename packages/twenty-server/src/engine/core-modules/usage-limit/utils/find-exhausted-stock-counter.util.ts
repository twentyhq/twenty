import { isDefined } from 'twenty-shared/utils';

import { type StockCost } from 'src/engine/core-modules/usage-limit/types/stock-cost.type';
import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';

export const findExhaustedStockCounter = ({
  counters,
  remainings,
  cost,
}: {
  counters: StockCounter[];
  remainings: (number | null)[];
  cost: StockCost;
}): { counter: StockCounter; remaining: number } | null => {
  for (const [index, counter] of counters.entries()) {
    const remaining = remainings[index];

    if (isDefined(remaining) && remaining < (cost[counter.meter] ?? 0)) {
      return { counter, remaining };
    }
  }

  return null;
};
