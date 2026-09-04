import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';

export type AnchoredPeriodUnit = Exclude<PeriodUnit, 'second'>;
