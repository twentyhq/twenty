import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';

export const buildPeriodWindowKey = (
  counter: Pick<LimitQuotaCounter, 'periodUnit' | 'periodStart'>,
): string => `${counter.periodUnit}:${counter.periodStart.getTime()}`;

export const buildPeriodGroupKey = (
  counter: Pick<
    LimitQuotaCounter,
    'resourceType' | 'periodUnit' | 'periodStart'
  >,
): string => `${counter.resourceType}:${buildPeriodWindowKey(counter)}`;
