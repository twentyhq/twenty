import { USAGE_LIMIT_DEFINITIONS } from 'src/engine/core-modules/usage-limit/constants/usage-limit-definitions.constant';
import { type UsageLimitDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/usage-limit-default-definition.type';
import { type UsageLimitDefinitions } from 'src/engine/core-modules/usage-limit/types/usage-limit-definition.type';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const findUsageLimitDefaults = ({
  resourceType,
}: {
  resourceType: UsageResourceType;
}): UsageLimitDefaultDefinition[] => {
  const { speed, quota, stock }: UsageLimitDefinitions =
    USAGE_LIMIT_DEFINITIONS[resourceType];

  return [
    ...(speed?.defaults ?? []),
    ...(quota?.defaults ?? []),
    ...(stock?.defaults ?? []),
  ];
};
