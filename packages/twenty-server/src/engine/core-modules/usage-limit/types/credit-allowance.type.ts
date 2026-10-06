import { type CreditAllowanceSchedule } from 'src/engine/core-modules/usage-limit/types/credit-allowance-schedule.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';

export type CreditAllowance = UsagePeriod & {
  schedule: CreditAllowanceSchedule;
};
