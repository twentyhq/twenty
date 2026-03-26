/* @license Enterprise */

import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

export type UsageEvent = {
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  creditsUsedMicro: number;
  quantity: number;
  unit: UsageUnit;
  resourceId?: string | null;
  resourceContext?: string | null;
  userWorkspaceId?: string | null;
};
