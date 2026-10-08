import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';

export const buildPeriodGroupKey = (counter: LimitQuotaCounter): string =>
  `${counter.resourceType}:${counter.periodUnit}:${counter.periodStart.getTime()}`;
