import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';

const ABSENT = '-';

export const buildServerSpeedBucketKey = ({
  resourceType,
  operationType,
  spenderType,
  spenderId,
  windowSeconds,
}: {
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenderType: SpenderType;
  spenderId?: string | null;
  windowSeconds: number;
}): string =>
  `{server}:speed:${resourceType}:${operationType}:${spenderType}:${spenderId || ABSENT}:${windowSeconds}`;
