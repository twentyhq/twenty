import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';

export type UserAllowanceQuotaCounter = Omit<LimitQuotaCounter, 'kind'> & {
  kind: 'userAllowance';
};
