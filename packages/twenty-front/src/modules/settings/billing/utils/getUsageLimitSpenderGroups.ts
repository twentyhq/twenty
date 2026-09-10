import { isDefined } from 'twenty-shared/utils';

import {
  USAGE_LIMIT_SPENDER_GROUPS,
  type UsageLimitSpenderGroup,
} from '@/settings/billing/constants/UsageLimitSpenderGroups';

export const getUsageLimitSpenderGroups = (
  allowedSpenderTypes: string[],
): UsageLimitSpenderGroup[] =>
  USAGE_LIMIT_SPENDER_GROUPS.map((group) => ({
    ...group,
    spenderType:
      isDefined(group.spenderType) &&
      allowedSpenderTypes.includes(group.spenderType)
        ? group.spenderType
        : null,
    subSpenderTypes: group.subSpenderTypes.filter((spenderType) =>
      allowedSpenderTypes.includes(spenderType),
    ),
  })).filter(
    (group) => isDefined(group.spenderType) || group.subSpenderTypes.length > 0,
  );
