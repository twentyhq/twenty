import { USAGE_LIMIT_DEFINITIONS } from 'src/engine/core-modules/usage-limit/constants/usage-limit-definitions.constant';
import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type UsageLimitDefinition } from 'src/engine/core-modules/usage-limit/types/usage-limit-definition.type';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const findUsageLimitDefinition = ({
  resourceType,
  limitKind,
}: {
  resourceType: UsageResourceType;
  limitKind: LimitKind;
}): UsageLimitDefinition | undefined =>
  USAGE_LIMIT_DEFINITIONS[resourceType]?.[limitKind];
