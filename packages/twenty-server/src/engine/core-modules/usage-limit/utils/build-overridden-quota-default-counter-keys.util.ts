import { isDefined } from 'twenty-shared/utils';

import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type QuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/quota-limit-default.type';
import { type UsageLimitCounterScope } from 'src/engine/core-modules/usage-limit/types/usage-limit-counter-scope.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';
import { buildQuotaDefaultCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-default-counter-key.util';
import { doesUsageLimitRowSuppressDefault } from 'src/engine/core-modules/usage-limit/utils/does-usage-limit-row-suppress-default.util';

export const buildOverriddenQuotaDefaultCounterKeys = ({
  usageLimit,
  quotaLimitDefaults,
  periodByUnit,
}: {
  usageLimit: UsageLimitCounterScope;
  quotaLimitDefaults: QuotaLimitDefault[];
  periodByUnit: Partial<Record<PeriodUnit, UsagePeriod>>;
}): string[] =>
  quotaLimitDefaults
    .filter((quotaLimitDefault) =>
      doesUsageLimitRowSuppressDefault({
        scope: usageLimit,
        usageLimitDefault: quotaLimitDefault,
      }),
    )
    .flatMap((quotaLimitDefault) => {
      const period = periodByUnit[quotaLimitDefault.periodUnit];

      if (!isDefined(period)) {
        return [];
      }

      return [
        buildQuotaDefaultCounterKey({
          workspaceId: usageLimit.workspaceId,
          resourceType: quotaLimitDefault.resourceType,
          operationType: quotaLimitDefault.operationType,
          spenderType: quotaLimitDefault.spenderType,
          spenderId: quotaLimitDefault.spenderId,
          meter: quotaLimitDefault.meter,
          periodUnit: quotaLimitDefault.periodUnit,
          periodStart: period.periodStart,
          limitValue: quotaLimitDefault.limitValue,
        }),
      ];
    });
