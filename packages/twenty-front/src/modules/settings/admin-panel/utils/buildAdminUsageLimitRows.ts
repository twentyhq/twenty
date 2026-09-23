import { isDefined } from 'twenty-shared/utils';

import { type AdminUsageLimitRow } from '@/settings/admin-panel/types/AdminUsageLimitRow';
import { type WorkspaceUsageLimitsQuery } from '~/generated-admin/graphql';

type WorkspaceUsageLimits = WorkspaceUsageLimitsQuery['workspaceUsageLimits'];
type WorkspaceUsageLimitDefault = WorkspaceUsageLimits['defaults'][number];
type WorkspaceUsageLimitRow = WorkspaceUsageLimits['limits'][number];

const buildSortKey = (row: AdminUsageLimitRow): string =>
  `${row.resourceType}:${row.limitKind}:${row.operationType}:${row.spenderType}:${row.periodCount}`;

// Everything a single override replaces at once: the speed rule drops every
// overridable default of a spender type and operation as soon as one
// workspace-wide row exists, whatever window each of them covers.
const buildSuppressionKey = (
  usageLimitDefault: WorkspaceUsageLimitDefault,
): string =>
  `${usageLimitDefault.resourceType}:${usageLimitDefault.operationType}:${usageLimitDefault.spenderType}:${usageLimitDefault.limitKind}:${usageLimitDefault.meter}`;

// Only a row covering this default's own period stands in for it; a row on
// another period suppresses it without replacing it, so the default stays
// writable and the operator can restate it.
const coversDefault = (
  usageLimitDefault: WorkspaceUsageLimitDefault,
  usageLimit: WorkspaceUsageLimitRow,
): boolean =>
  usageLimit.periodUnit === usageLimitDefault.periodUnit &&
  usageLimit.periodCount === usageLimitDefault.periodCount;

export const buildAdminUsageLimitRows = (
  workspaceUsageLimits: WorkspaceUsageLimits,
): AdminUsageLimitRow[] => {
  const usageLimitById = new Map(
    workspaceUsageLimits.limits.map((usageLimit) => [
      usageLimit.id,
      usageLimit,
    ]),
  );

  const overridableCountByScope = workspaceUsageLimits.defaults.reduce<
    Map<string, number>
  >((counts, usageLimitDefault) => {
    if (!usageLimitDefault.isOverridable) {
      return counts;
    }

    const key = buildSuppressionKey(usageLimitDefault);

    return counts.set(key, (counts.get(key) ?? 0) + 1);
  }, new Map());

  return workspaceUsageLimits.defaults
    .map((usageLimitDefault, index) => ({ usageLimitDefault, index }))
    .filter(({ usageLimitDefault }) => usageLimitDefault.isOverridable)
    .map(({ usageLimitDefault, index }) => {
      const suppressingUsageLimit = isDefined(
        usageLimitDefault.overriddenByUsageLimitId,
      )
        ? usageLimitById.get(usageLimitDefault.overriddenByUsageLimitId)
        : undefined;
      const override =
        isDefined(suppressingUsageLimit) &&
        coversDefault(usageLimitDefault, suppressingUsageLimit)
          ? suppressingUsageLimit
          : undefined;
      const defaultValue = Number(usageLimitDefault.limitValue);

      return {
        id: `usage-limit-default-${index}`,
        resourceType: usageLimitDefault.resourceType,
        operationType: usageLimitDefault.operationType,
        spenderType: usageLimitDefault.spenderType,
        limitKind: usageLimitDefault.limitKind,
        periodCount: usageLimitDefault.periodCount,
        periodUnit: usageLimitDefault.periodUnit,
        meter: usageLimitDefault.meter,
        defaultValue,
        limitValue: isDefined(override)
          ? Number(override.limitValue)
          : defaultValue,
        burstValue:
          isDefined(override) && isDefined(override.burstValue)
            ? Number(override.burstValue)
            : null,
        usageLimitId: override?.id ?? null,
        isOverridden: isDefined(override),
        isEnforcedOnCurrentPlan: usageLimitDefault.isEnforcedOnCurrentPlan,
        limitValueConfigVariable: usageLimitDefault.limitValueConfigVariable,
        suppressedTogetherCount:
          overridableCountByScope.get(buildSuppressionKey(usageLimitDefault)) ??
          1,
      };
    })
    .sort((rowA, rowB) => buildSortKey(rowA).localeCompare(buildSortKey(rowB)));
};
