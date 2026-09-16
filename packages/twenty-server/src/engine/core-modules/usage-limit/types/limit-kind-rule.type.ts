import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type UsageMeter } from 'src/engine/core-modules/usage-limit/types/usage-meter.type';

export type LimitKindRule = {
  isAllOperationTypeAllowed: boolean;
  allowedPeriodUnits: readonly PeriodUnit[];
  requiredPeriodCount: number | null;
  allowedMeters: readonly UsageMeter[];
  isBurstValueAllowed: boolean;
};
