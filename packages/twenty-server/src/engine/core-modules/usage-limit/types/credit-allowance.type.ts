import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';

export type CreditAllowance = UsagePeriod & {
  allowanceMicro: number;
};
