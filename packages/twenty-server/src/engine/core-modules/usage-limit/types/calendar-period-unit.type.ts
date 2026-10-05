import { type AnchoredPeriodUnit } from 'src/engine/core-modules/usage-limit/types/anchored-period-unit.type';

export type CalendarPeriodUnit = Exclude<AnchoredPeriodUnit, 'allowancePeriod'>;
