import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const findFixedSpeedWindowSeconds = ({
  resourceType,
  operationType,
}: {
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
}): number | null => {
  for (const speedLimitDefault of findUsageLimitDefinition({
    resourceType,
    limitKind: 'speed',
  })?.defaults ?? []) {
    if (
      speedLimitDefault.operationType === operationType &&
      'windowSeconds' in speedLimitDefault
    ) {
      return speedLimitDefault.windowSeconds;
    }
  }

  return null;
};
