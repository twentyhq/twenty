import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const ABSENT = '-';
const ALL_OPERATIONS = 'ALL';

export const buildQuotaCounterKey = ({
  workspaceId,
  resourceType,
  operationType,
  spenderType,
  spenderId,
  periodUnit,
  periodStart,
}: {
  workspaceId: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenderType: SpenderType;
  spenderId?: string | null;
  periodUnit: PeriodUnit;
  periodStart: Date;
}): string =>
  `{${workspaceId}}:quota:${resourceType}:${operationType || ALL_OPERATIONS}:${spenderType}:${spenderId || ABSENT}:${periodUnit}:${periodStart.getTime()}`;
