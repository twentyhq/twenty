import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';

export const buildQuotaDefaultActiveValueEntries = ({
  defaultCounters,
  activeValueKeys,
  activeValues,
  now,
}: {
  defaultCounters: LimitQuotaCounter[];
  activeValueKeys: string[];
  activeValues: (number | undefined)[];
  now: number;
}): { key: string; value: number; ttl: number }[] =>
  defaultCounters.flatMap((counter, index) => {
    const ttl = counter.periodEnd.getTime() - now;

    if (activeValues[index] === counter.limitValue || ttl <= 0) {
      return [];
    }

    return [{ key: activeValueKeys[index], value: counter.limitValue, ttl }];
  });
