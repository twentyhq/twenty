import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageMeter } from 'src/engine/core-modules/usage-limit/types/usage-meter.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

export type QuotaBound = {
  key: string;
  limitValue: number;
  meter: UsageMeter;
  periodUnit: PeriodUnit;
  periodStart: Date;
  periodEnd: Date;
  spenderType: SpenderType;
  spenderId: string | null;
  operationType: UsageOperationType;
};
