import { type UsageConsumptionWindow } from 'src/engine/core-modules/usage/types/usage-consumption-window.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { buildPeriodWindowKey } from 'src/engine/core-modules/usage-limit/utils/build-period-group-key.util';
import { getPeriodAnchor } from 'src/engine/core-modules/usage-limit/utils/get-period-anchor.util';

export const buildConsumptionWindows = (
  coldLimitCounters: LimitQuotaCounter[],
): UsageConsumptionWindow[] => {
  const windowByKey = new Map<string, UsageConsumptionWindow>();

  for (const counter of coldLimitCounters) {
    const windowKey = buildPeriodWindowKey(counter);
    const window = windowByKey.get(windowKey);

    if (!window) {
      windowByKey.set(windowKey, {
        windowKey,
        resourceTypes: [counter.resourceType],
        periodStart: counter.periodStart,
        periodEnd: counter.periodEnd,
        periodAnchor: getPeriodAnchor(counter.periodUnit),
      });
      continue;
    }

    if (!window.resourceTypes.includes(counter.resourceType)) {
      window.resourceTypes.push(counter.resourceType);
    }
  }

  return [...windowByKey.values()];
};
