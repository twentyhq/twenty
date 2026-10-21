import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type QuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/quota-limit-default.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';
import { type UserAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/user-allowance-quota-counter.type';
import { buildQuotaCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-counter-key.util';
import { normalizeSpenderId } from 'src/engine/core-modules/usage-limit/utils/normalize-spender-id.util';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

export const buildQuotaDefaultCounter = ({
  workspaceId,
  quotaLimitDefault,
  spenderId,
  period,
}: {
  workspaceId: string;
  quotaLimitDefault: QuotaLimitDefault;
  spenderId: string;
  period: UsagePeriod;
}): LimitQuotaCounter | UserAllowanceQuotaCounter => {
  const counter = {
    kind:
      quotaLimitDefault.unit === UsageUnit.USER_CREDIT
        ? ('userAllowance' as const)
        : ('limit' as const),
    isDefault: true,
    limitValue: quotaLimitDefault.limitValue,
    unit: quotaLimitDefault.unit,
    resourceType: quotaLimitDefault.resourceType,
    periodUnit: quotaLimitDefault.periodUnit,
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    spenderType: quotaLimitDefault.spenderType,
    spenderId: normalizeSpenderId(spenderId),
    operationTypes: quotaLimitDefault.operationTypes,
  };

  return { ...counter, key: buildQuotaCounterKey({ workspaceId, counter }) };
};
