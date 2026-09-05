import { isDefined } from 'twenty-shared/utils';

import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';
import { buildQuotaCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-counter-key.util';
import { isIntraWorkspaceScoped } from 'src/engine/core-modules/usage-limit/utils/is-intra-workspace-scoped.util';

export const buildIntraWorkspaceLimitCounterKeys = ({
  workspaceId,
  limits,
  periodByUnit,
}: {
  workspaceId: string;
  limits: FlatUsageLimit[];
  periodByUnit: Partial<Record<PeriodUnit, UsagePeriod>>;
}): string[] =>
  limits
    .filter(
      (limit) =>
        limit.limitKind === 'quota' &&
        isIntraWorkspaceScoped(limit.spenderType),
    )
    .flatMap((limit) => {
      const period = periodByUnit[limit.periodUnit];

      if (!isDefined(period)) {
        return [];
      }

      return [
        buildQuotaCounterKey({
          workspaceId,
          resourceType: limit.resourceType,
          operationType: limit.operationType,
          spenderType: limit.spenderType,
          spenderId: limit.spenderId,
          meter: limit.meter,
          periodUnit: limit.periodUnit,
          periodStart: period.periodStart,
        }),
      ];
    });
