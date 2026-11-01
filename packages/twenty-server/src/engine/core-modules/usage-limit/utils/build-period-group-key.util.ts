import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type UserAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/user-allowance-quota-counter.type';

export const buildPeriodGroupKey = (
  counter: LimitQuotaCounter | UserAllowanceQuotaCounter,
): string =>
  `${counter.resourceType}:${counter.periodUnit}:${counter.periodStart.getTime()}`;
