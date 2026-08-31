import { isDefined } from 'twenty-shared/utils';

import { SPENDER_TYPE_SPECIFICITY } from 'src/engine/core-modules/usage-limit/constants/spender-type-specificity.constant';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type QuotaBound } from 'src/engine/core-modules/usage-limit/types/quota-bound.type';
import { buildQuotaCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-counter-key.util';
import { buildSpendersFromUsageSpenders } from 'src/engine/core-modules/usage-limit/utils/build-spenders-from-usage-spenders.util';
import { findRulesForSpender } from 'src/engine/core-modules/usage-limit/utils/find-rules-for-spender.util';
import { resolveQuotaLimitValue } from 'src/engine/core-modules/usage-limit/utils/resolve-quota-limit-value.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsagePeriod } from 'src/engine/core-modules/usage/types/usage-period.type';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';

const boundSpecificity = (bound: QuotaBound): number =>
  SPENDER_TYPE_SPECIFICITY[bound.spenderType] * 4 +
  (isDefined(bound.spenderId) ? 0 : 2) +
  (bound.operationType === UsageOperationType.ALL ? 1 : 0);

export const buildQuotaBounds = ({
  rules,
  usageSpenders,
  workspaceId,
  resourceType,
  operationType,
  periodByUnit,
  allowanceMicro,
}: {
  rules: FlatUsageLimit[];
  usageSpenders: UsageSpenders;
  workspaceId: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  periodByUnit: Partial<Record<PeriodUnit, UsagePeriod>>;
  allowanceMicro: number | null;
}): QuotaBound[] => {
  const spenders = buildSpendersFromUsageSpenders(usageSpenders);

  const bounds = spenders.flatMap((spender) =>
    findRulesForSpender({ rules, spender, operationType }).flatMap((rule) => {
      const limitValue = resolveQuotaLimitValue({ rule, allowanceMicro });
      const period = periodByUnit[rule.periodUnit];

      if (!isDefined(limitValue) || !isDefined(period)) {
        return [];
      }

      return [
        {
          key: buildQuotaCounterKey({
            workspaceId,
            resourceType,
            operationType: rule.operationType,
            spenderType: rule.spenderType,
            spenderId: rule.spenderId || null,
            periodUnit: rule.periodUnit,
            periodStart: period.periodStart,
          }),
          limitValue,
          meter: rule.meter,
          periodUnit: rule.periodUnit,
          periodStart: period.periodStart,
          periodEnd: period.periodEnd,
          spenderType: rule.spenderType,
          spenderId: rule.spenderId === '' ? null : rule.spenderId,
          operationType: rule.operationType,
        },
      ];
    }),
  );

  return bounds.sort((a, b) => boundSpecificity(a) - boundSpecificity(b));
};
