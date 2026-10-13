import { isDefined } from 'twenty-shared/utils';

import { type UsageBreakdownItem } from 'src/engine/core-modules/usage/services/usage-analytics.service';

type AddMemberCreditsUsedToUsageBreakdownParams = {
  items: UsageBreakdownItem[];
  memberCreditsUsedMicroByKey: Map<string, number> | null;
};

export const addMemberCreditsUsedToUsageBreakdown = ({
  items,
  memberCreditsUsedMicroByKey,
}: AddMemberCreditsUsedToUsageBreakdownParams): UsageBreakdownItem[] =>
  items.map((item) => ({
    ...item,
    memberCreditsUsed: isDefined(memberCreditsUsedMicroByKey)
      ? (memberCreditsUsedMicroByKey.get(item.key) ?? 0)
      : null,
  }));
