import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';

const ABSENT = '-';

export const buildSpeedBucketKey = ({
  workspaceId,
  resourceType,
  operationType,
  spenderType,
  spenderId,
  windowSeconds,
}: {
  workspaceId: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenderType: SpenderType;
  spenderId?: string | null;
  windowSeconds: number;
}): string =>
  `{${workspaceId}}:speed:${resourceType}:${operationType}:${spenderType}:${spenderId || ABSENT}:${windowSeconds}`;
