/* @license Enterprise */

import { type UsageResourceType } from 'src/engine/core-modules/billing/enums/usage-resource-type.enum';
import { type UsageOperationType } from 'src/engine/core-modules/billing/enums/usage-operation-type.enum';
import { type UsageUnit } from 'src/engine/core-modules/billing/enums/usage-unit.enum';

export type UsageEvent = {
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  creditsUsed: number;
  quantity: number;
  unit: UsageUnit;
  resourceId?: string | null;
  resourceContext?: string | null;
  userWorkspaceId?: string | null;
};
