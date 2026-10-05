import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';

export type LimitKindRule = {
  isAllOperationTypeAllowed: boolean;
  allowedPeriodUnits: readonly PeriodUnit[];
  requiredPeriodCount: number | null;
  isBurstValueAllowed: boolean;
};
