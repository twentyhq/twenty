import { USAGE_LIMIT_DEFINITIONS } from 'src/engine/core-modules/usage-limit/constants/usage-limit-definitions.constant';
import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type UsageLimitDefinitions } from 'src/engine/core-modules/usage-limit/types/usage-limit-definition.type';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export const findUsageLimitDefinition = <TLimitKind extends LimitKind>({
  resourceType,
  limitKind,
}: {
  resourceType: UsageResourceType;
  limitKind: TLimitKind;
}): UsageLimitDefinitions[TLimitKind] =>
  USAGE_LIMIT_DEFINITIONS[resourceType][limitKind];
