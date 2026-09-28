import { ANCHORED_PERIOD_UNITS } from 'src/engine/core-modules/usage-limit/constants/period-units.constant';
import { type AnchoredPeriodUnit } from 'src/engine/core-modules/usage-limit/types/anchored-period-unit.type';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';

export const isAnchoredPeriodUnit = (
  periodUnit: PeriodUnit,
): periodUnit is AnchoredPeriodUnit =>
  ANCHORED_PERIOD_UNITS.includes(periodUnit as AnchoredPeriodUnit);
