import { type CounterScope } from 'src/engine/core-modules/usage-limit/types/counter-scope.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const ABSENT = '-';
const SERVER_SCOPE = 'server';

export const buildSpeedBucketKey = ({
  counterScope,
  workspaceId,
  resourceType,
  operationType,
  spenderType,
  spenderId,
  windowSeconds,
}: {
  counterScope: CounterScope;
  workspaceId: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenderType: SpenderType;
  spenderId?: string | null;
  windowSeconds: number;
}): string => {
  const scope = counterScope === 'crossWorkspace' ? SERVER_SCOPE : workspaceId;

  return `{${scope}}:speed:${resourceType}:${operationType}:${spenderType}:${spenderId || ABSENT}:${windowSeconds}`;
};
