import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const ABSENT = '-';
const ALL = 'ALL';

// The period start sits in the key, so rollover needs no reset: a new period
// reads a new, cold key while the old one expires with the old period.
export const buildQuotaCounterKey = ({
  workspaceId,
  resourceType,
  operationType,
  spenderType,
  spenderId,
  periodStart,
}: {
  workspaceId: string;
  resourceType: UsageResourceType | '';
  operationType: UsageOperationType | '';
  spenderType: SpenderType;
  spenderId?: string | null;
  periodStart: Date;
}): string =>
  `{${workspaceId}}:quota:${resourceType || ALL}:${operationType || ALL}:${spenderType}:${spenderId || ABSENT}:${periodStart.getTime()}`;
