import { isDefined } from 'twenty-shared/utils';

import { type UsageBreakdownItem } from 'src/engine/core-modules/usage/services/usage-analytics.service';

type AddUserCreditsUsedToUsageBreakdownParams = {
  items: UsageBreakdownItem[];
  userCreditsUsedMicroByKey: Map<string, number> | null;
};

export const addUserCreditsUsedToUsageBreakdown = ({
  items,
  userCreditsUsedMicroByKey,
}: AddUserCreditsUsedToUsageBreakdownParams): UsageBreakdownItem[] =>
  items.map((item) => ({
    ...item,
    userCreditsUsed: isDefined(userCreditsUsedMicroByKey)
      ? (userCreditsUsedMicroByKey.get(item.key) ?? 0)
      : null,
  }));
