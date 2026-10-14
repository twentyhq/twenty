import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type UserCreditsFallbackMode } from 'src/engine/core-modules/usage-limit/types/user-credits-fallback-mode.type';

export type UserAllowanceQuotaCounter = Omit<LimitQuotaCounter, 'kind'> & {
  kind: 'userAllowance';
  fallback: UserCreditsFallbackMode;
};
