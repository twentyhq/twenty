import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';

export type CreditAllowance = UsagePeriod & {
  allowanceMicro: number;
  // When the figure stops being right before the period ends: a grant lapsing
  // inside the period lowers it with no ledger write to drop the counter.
  validUntil: Date;
};
