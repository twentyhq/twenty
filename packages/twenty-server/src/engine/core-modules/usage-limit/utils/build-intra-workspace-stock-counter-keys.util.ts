import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { buildStockCounter } from 'src/engine/core-modules/usage-limit/utils/build-stock-counter.util';
import { findEnforceableLimits } from 'src/engine/core-modules/usage-limit/utils/find-enforceable-limits.util';
import { isStockLimit } from 'src/engine/core-modules/usage-limit/utils/is-stock-limit.util';

export const buildIntraWorkspaceStockCounterKeys = ({
  workspaceId,
  limits,
}: {
  workspaceId: string;
  limits: FlatUsageLimit[];
}): string[] => {
  const stockLimits = limits.filter(isStockLimit);

  const limitIdsEnforcedWithoutEntitlement = new Set(
    findEnforceableLimits({
      limits: stockLimits,
      isIntraWorkspaceLimitEntitled: false,
    }).map((limit) => limit.id),
  );

  return stockLimits
    .filter((limit) => !limitIdsEnforcedWithoutEntitlement.has(limit.id))
    .map((limit) => buildStockCounter({ workspaceId, limit }).key);
};
