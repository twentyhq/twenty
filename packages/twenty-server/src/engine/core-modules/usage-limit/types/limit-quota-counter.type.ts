import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

export type LimitQuotaCounter = {
  kind: 'limit';
  usageLimitId: string | null;
  isDefault: boolean;
  isEnforced: boolean;
  key: string;
  limitValue: number;
  unit: UsageUnit;
  resourceType: UsageResourceType;
  periodUnit: PeriodUnit;
  periodStart: Date;
  periodEnd: Date;
  spenderType: SpenderType;
  spenderId: string | null;
  operationType: UsageOperationType;
};
