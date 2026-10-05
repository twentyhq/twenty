import { type QuotaCost } from 'src/engine/core-modules/usage-limit/types/quota-cost.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { type QuotaDebit } from 'src/engine/core-modules/usage-limit/types/quota-debit.type';

export const buildQuotaDebits = ({
  counters,
  cost,
}: {
  counters: QuotaCounter[];
  cost: QuotaCost;
}): QuotaDebit[] =>
  counters.flatMap((counter) => {
    const amount = cost[counter.unit] ?? 0;

    return amount > 0 ? [{ counter, amount }] : [];
  });
