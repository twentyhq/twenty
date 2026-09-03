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

// Operations an app declared in its manifest get their own slice under the app
// name; anything it charged without declaring arrives already folded into a
// single app-level slice, so undeclared context strings never reach a screen.
// Uninstalled apps are looked up too, otherwise their spend would drop out of
// the pie while still counting towards the bill. Keying on the label also
// merges two apps sharing a display name, which would otherwise collide as one
// chart id.
export const consolidateUsageByApplication = ({
  items,
  flatApplicationMaps,
}: ConsolidateUsageByApplicationParams): UsageBreakdownItem[] => {
  const creditsByKey = new Map<string, number>();

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

    creditsByKey.set(key, (creditsByKey.get(key) ?? 0) + item.creditsUsed);
  }

  return [...creditsByKey.entries()]
    .map(([key, creditsUsed]) => ({ key, label: key, creditsUsed }))
    .sort((a, b) => b.creditsUsed - a.creditsUsed);
};
