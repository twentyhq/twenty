import { isNonEmptyString } from '@sniptt/guards';

import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageMeter } from 'src/engine/core-modules/usage-limit/types/usage-meter.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const ABSENT = '-';

export const buildQuotaCounterKey = ({
  workspaceId,
  resourceType,
  operationType,
  spenderType,
  spenderId,
  meter,
  periodUnit,
  periodStart,
}: {
  workspaceId: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenderType: SpenderType;
  spenderId?: string | null;
  meter: UsageMeter;
  periodUnit: PeriodUnit;
  periodStart: Date;
}): string =>
  `{${workspaceId}}:quota:${resourceType}:${operationType}:${spenderType}:${isNonEmptyString(spenderId) ? spenderId : ABSENT}:${meter}:${periodUnit}:${periodStart.getTime()}`;
