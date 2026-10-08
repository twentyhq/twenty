import {
  USAGE_LIMIT_SPENDER_GROUPS,
  type UsageLimitSpenderGroup,
} from '@/settings/billing/constants/UsageLimitSpenderGroups';

export const getUsageLimitSpenderGroups = (
  allowedSpenderTypes: string[],
): UsageLimitSpenderGroup[] =>
  USAGE_LIMIT_SPENDER_GROUPS.filter((group) =>
    allowedSpenderTypes.includes(group.spenderType),
  );
