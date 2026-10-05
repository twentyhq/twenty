import { isNonEmptyString } from '@sniptt/guards';

import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const ABSENT = '-';

export const buildQuotaCounterKey = ({
  workspaceId,
  resourceType,
  operationType,
  spenderType,
  spenderId,
  unit,
  periodUnit,
  periodStart,
  limitValue,
}: {
  workspaceId: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenderType: SpenderType;
  spenderId?: string | null;
  unit: UsageUnit;
  periodUnit: PeriodUnit;
  periodStart: Date;
  limitValue: number;
}): string =>
  `{${workspaceId}}:quota:${resourceType}:${operationType}:${spenderType}:${isNonEmptyString(spenderId) ? spenderId : ABSENT}:${unit}:${periodUnit}:${periodStart.getTime()}:${limitValue}`;
