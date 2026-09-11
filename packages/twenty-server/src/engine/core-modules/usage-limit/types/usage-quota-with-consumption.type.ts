import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageMeter } from 'src/engine/core-modules/usage-limit/types/usage-meter.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export type UsageQuotaWithConsumption = {
  id: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenderType: SpenderType;
  spenderId: string | null;
  spenderLabel: string | null;
  periodUnit: PeriodUnit;
  meter: UsageMeter;
  limitValue: number;
  isEnforced: boolean;
  consumedValue: number | null;
  remainingValue: number | null;
  periodStart: Date | null;
  periodEnd: Date | null;
};
