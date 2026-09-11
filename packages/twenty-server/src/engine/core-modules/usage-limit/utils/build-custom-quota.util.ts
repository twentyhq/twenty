import { isDefined } from 'twenty-shared/utils';

import { type LimitConsumption } from 'src/engine/core-modules/usage-limit/types/limit-consumption.type';
import { type UsageQuotaWithConsumption } from 'src/engine/core-modules/usage-limit/types/usage-quota-with-consumption.type';
import { type UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { normalizeSpenderId } from 'src/engine/core-modules/usage-limit/utils/normalize-spender-id.util';

type CustomQuotaScope = Pick<
  UsageLimitEntity,
  | 'id'
  | 'resourceType'
  | 'operationType'
  | 'spenderType'
  | 'spenderId'
  | 'periodUnit'
  | 'meter'
  | 'limitValue'
>;

export const buildCustomQuota = ({
  usageLimit,
  isEnforced,
  consumption,
  spenderLabel,
}: {
  usageLimit: CustomQuotaScope;
  isEnforced: boolean;
  consumption: LimitConsumption | undefined;
  spenderLabel: string | null;
}): UsageQuotaWithConsumption => ({
  id: usageLimit.id,
  resourceType: usageLimit.resourceType,
  operationType: usageLimit.operationType,
  spenderType: usageLimit.spenderType,
  spenderId: normalizeSpenderId(usageLimit.spenderId),
  spenderLabel,
  periodUnit: usageLimit.periodUnit,
  meter: usageLimit.meter,
  limitValue: usageLimit.limitValue,
  isEnforced,
  consumedValue: consumption?.consumedValue ?? null,
  remainingValue: consumption?.remainingValue ?? null,
  periodStart: isDefined(consumption) ? consumption.periodStart : null,
  periodEnd: isDefined(consumption) ? consumption.periodEnd : null,
});
