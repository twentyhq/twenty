import { type LimitValueType } from 'src/engine/core-modules/usage-limit/types/limit-value-type.type';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageMeter } from 'src/engine/core-modules/usage-limit/types/usage-meter.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export type LimitQuotaCounter = {
  kind: 'limit';
  key: string;
  limitValueType: LimitValueType;
  limitValue: number;
  meter: UsageMeter;
  resourceType: UsageResourceType;
  periodUnit: PeriodUnit;
  periodStart: Date;
  periodEnd: Date;
  spenderType: SpenderType;
  spenderId: string | null;
  operationType: UsageOperationType;
};
