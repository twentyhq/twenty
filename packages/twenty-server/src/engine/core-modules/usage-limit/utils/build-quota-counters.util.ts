import { isDefined } from 'twenty-shared/utils';

import { SPENDER_TYPE_SPECIFICITY } from 'src/engine/core-modules/usage-limit/constants/spender-type-specificity.constant';
import { type FlatQuotaLimit } from 'src/engine/core-modules/usage-limit/types/flat-quota-limit.type';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type QuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/quota-limit-default.type';
import { type UserAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/user-allowance-quota-counter.type';
import { buildLimitQuotaCounter } from 'src/engine/core-modules/usage-limit/utils/build-limit-quota-counter.util';
import { buildQuotaDefaultCounter } from 'src/engine/core-modules/usage-limit/utils/build-quota-default-counter.util';
import { buildSpendersFromUsageSpenders } from 'src/engine/core-modules/usage-limit/utils/build-spenders-from-usage-spenders.util';
import { doesUsageLimitRowSuppressDefault } from 'src/engine/core-modules/usage-limit/utils/does-usage-limit-row-suppress-default.util';
import { findLimitsForSpender } from 'src/engine/core-modules/usage-limit/utils/find-limits-for-spender.util';
import { isOperationInScope } from 'src/engine/core-modules/usage-limit/utils/is-operation-in-scope.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';

const usageScopeSpecificity = (
  counter: Pick<LimitQuotaCounter, 'resourceType' | 'operationTypes'>,
): number => {
  if (counter.resourceType === UsageResourceType.ALL) {
    return 3;
  }

  if (counter.operationTypes.includes(UsageOperationType.ALL)) {
    return 2;
  }

  return counter.operationTypes.length > 1 ? 1 : 0;
};

const counterSpecificity = (
  counter: Pick<
    LimitQuotaCounter,
    'spenderType' | 'spenderId' | 'resourceType' | 'operationTypes'
  >,
): number =>
  SPENDER_TYPE_SPECIFICITY[counter.spenderType] * 8 +
  (isDefined(counter.spenderId) ? 0 : 4) +
  usageScopeSpecificity(counter);

export const buildQuotaCounters = ({
  limits,
  quotaLimitDefaults,
  usageSpenders,
  workspaceId,
  operationType,
  periodByUnit,
}: {
  limits: FlatQuotaLimit[];
  quotaLimitDefaults: QuotaLimitDefault[];
  usageSpenders: UsageSpenders;
  workspaceId: string;
  operationType: UsageOperationType;
  periodByUnit: Partial<Record<PeriodUnit, UsagePeriod>>;
}): (LimitQuotaCounter | UserAllowanceQuotaCounter)[] => {
  const spenders = buildSpendersFromUsageSpenders(usageSpenders);

  const limitCounters = spenders.flatMap((spender) =>
    findLimitsForSpender({ limits, spender, operationType }).flatMap(
      (limit) => {
        const period = periodByUnit[limit.periodUnit];

        if (!isDefined(period)) {
          return [];
        }

        return [buildLimitQuotaCounter({ workspaceId, limit, period })];
      },
    ),
  );

  const spenderTypes = new Set(spenders.map((spender) => spender.spenderType));

  const defaultCounters = quotaLimitDefaults
    .filter(
      (quotaLimitDefault) =>
        isOperationInScope({
          operationTypes: quotaLimitDefault.operationTypes,
          operationType,
        }) &&
        spenderTypes.has(quotaLimitDefault.spenderType) &&
        !(
          quotaLimitDefault.unit === UsageUnit.USER_CREDIT &&
          quotaLimitDefault.limitValue === 0
        ) &&
        !limits.some((limit) =>
          doesUsageLimitRowSuppressDefault({
            scope: limit,
            usageLimitDefault: quotaLimitDefault,
          }),
        ),
    )
    .flatMap((quotaLimitDefault) => {
      const period = periodByUnit[quotaLimitDefault.periodUnit];

      if (!isDefined(period)) {
        return [];
      }

      const spenderIds = quotaLimitDefault.isPerSpender
        ? spenders
            .filter(
              (spender) =>
                spender.spenderType === quotaLimitDefault.spenderType,
            )
            .map((spender) => spender.spenderId)
        : [quotaLimitDefault.spenderId];

      return spenderIds.map((spenderId) =>
        buildQuotaDefaultCounter({
          workspaceId,
          quotaLimitDefault,
          spenderId,
          period,
        }),
      );
    });

  return [...limitCounters, ...defaultCounters].sort(
    (a, b) => counterSpecificity(a) - counterSpecificity(b),
  );
};
