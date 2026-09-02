import { type UsagePeriod } from 'src/engine/core-modules/usage/types/usage-period.type';

export type CreditAllowance = UsagePeriod & {
  allowanceMicro: number;
};
