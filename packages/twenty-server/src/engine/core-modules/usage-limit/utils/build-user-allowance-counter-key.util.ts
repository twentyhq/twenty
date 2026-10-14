import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const buildUserAllowanceCounterKey = ({
  workspaceId,
  userWorkspaceId,
  resourceType,
  operationType,
  periodStart,
}: {
  workspaceId: string;
  userWorkspaceId: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  periodStart: Date;
}): string =>
  `{${workspaceId}}:quota-consumed:user-allowance:${resourceType}:${operationType}:${userWorkspaceId}:${periodStart.getTime()}`;
