import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type UsageLimits } from 'src/engine/core-modules/usage-limit/types/usage-limits.type';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const findLimitsForResource = ({
  usageLimits,
  resourceType,
}: {
  usageLimits: UsageLimits;
  resourceType: UsageResourceType;
}): FlatUsageLimit[] => [
  ...(usageLimits.byResourceType[resourceType] ?? []),
  ...(usageLimits.byResourceType[UsageResourceType.ALL] ?? []),
];
