import { type UserAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/user-allowance-quota-counter.type';
import { type UserCreditsFallbackMode } from 'src/engine/core-modules/usage-limit/types/user-credits-fallback-mode.type';

export type UserAllowance = {
  counters: [UserAllowanceQuotaCounter, ...UserAllowanceQuotaCounter[]];
  fallback: UserCreditsFallbackMode;
};
