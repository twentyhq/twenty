import { isDefined } from 'twenty-shared/utils';

import { type AdminUsageLimitRow } from '@/settings/admin-panel/types/AdminUsageLimitRow';
import { type WorkspaceUsageLimitsQuery } from '~/generated-admin/graphql';

type WorkspaceUsageLimits = WorkspaceUsageLimitsQuery['workspaceUsageLimits'];

const buildSortKey = (row: AdminUsageLimitRow): string =>
  `${row.resourceType}:${row.limitKind}:${row.operationType}:${row.spenderType}:${row.periodCount}`;

export const buildAdminUsageLimitRows = (
  workspaceUsageLimits: WorkspaceUsageLimits,
): AdminUsageLimitRow[] => {
  const usageLimitById = new Map(
    workspaceUsageLimits.limits.map((usageLimit) => [
      usageLimit.id,
      usageLimit,
    ]),
  );

  return workspaceUsageLimits.defaults
    .map((usageLimitDefault, index) => ({ usageLimitDefault, index }))
    .filter(({ usageLimitDefault }) => usageLimitDefault.isOverridable)
    .map(({ usageLimitDefault, index }) => {
      const override = isDefined(usageLimitDefault.overriddenByUsageLimitId)
        ? usageLimitById.get(usageLimitDefault.overriddenByUsageLimitId)
        : undefined;
      const defaultValue = Number(usageLimitDefault.limitValue);

      return {
        id: `usage-limit-default-${index}`,
        resourceType: usageLimitDefault.resourceType,
        operationType: usageLimitDefault.operationType,
        spenderType: usageLimitDefault.spenderType,
        limitKind: usageLimitDefault.limitKind,
        periodCount: override?.periodCount ?? usageLimitDefault.periodCount,
        periodUnit: override?.periodUnit ?? usageLimitDefault.periodUnit,
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
      };
    })
    .sort((rowA, rowB) => buildSortKey(rowA).localeCompare(buildSortKey(rowB)));
};
