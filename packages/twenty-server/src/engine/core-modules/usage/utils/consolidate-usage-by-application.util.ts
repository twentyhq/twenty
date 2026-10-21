import { isDefined } from 'twenty-shared/utils';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import {
  type UsageApplicationBreakdownItem,
  type UsageBreakdownItem,
} from 'src/engine/core-modules/usage/services/usage-analytics.service';

type ConsolidateUsageByApplicationParams = {
  items: UsageApplicationBreakdownItem[];
  flatApplicationMaps: FlatApplicationCacheMaps;
};

// Uninstalled apps are looked up too, or their spend would drop out of the pie while still billed.
// Keying on the label merges apps sharing a display name, which would otherwise collide as one chart id.
export const consolidateUsageByApplication = ({
  items,
  flatApplicationMaps,
}: ConsolidateUsageByApplicationParams): UsageBreakdownItem[] => {
  const itemsByKey = new Map<string, UsageBreakdownItem>();

  for (const item of items) {
    const application = flatApplicationMaps.byId[item.applicationId];
    // Undefined until the upgrade that adds the column has run.
    const declaredCharges = {
      ...(application?.billing?.recurring ?? {}),
      ...(application?.billing?.operations ?? {}),
    };
    const declaredCharge = declaredCharges[item.operation];
    const applicationName = application?.name ?? item.applicationId;

    const key = isDefined(declaredCharge)
      ? `${applicationName} · ${declaredCharge.label}`
      : applicationName;

    const consolidatedItem = itemsByKey.get(key);

    itemsByKey.set(key, {
      key,
      label: key,
      creditsUsed: (consolidatedItem?.creditsUsed ?? 0) + item.creditsUsed,
      userCreditsUsed:
        (consolidatedItem?.userCreditsUsed ?? 0) + item.userCreditsUsed,
      workspaceCreditsUsed:
        (consolidatedItem?.workspaceCreditsUsed ?? 0) +
        item.workspaceCreditsUsed,
    });
  }

  return [...itemsByKey.values()].sort(
    (a, b) => b.workspaceCreditsUsed - a.workspaceCreditsUsed,
  );
};
