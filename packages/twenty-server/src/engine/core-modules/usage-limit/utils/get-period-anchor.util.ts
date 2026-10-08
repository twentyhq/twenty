import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type UsagePeriodAnchor } from 'src/engine/core-modules/usage/types/usage-period-anchor.type';

export const getPeriodAnchor = (periodUnit: PeriodUnit): UsagePeriodAnchor =>
  periodUnit === 'allowancePeriod' ? 'billing' : 'calendar';
