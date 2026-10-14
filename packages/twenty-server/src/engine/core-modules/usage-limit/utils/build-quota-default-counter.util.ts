import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type QuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/quota-limit-default.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';
import { buildQuotaCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-counter-key.util';
import { normalizeSpenderId } from 'src/engine/core-modules/usage-limit/utils/normalize-spender-id.util';

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
}): LimitQuotaCounter => {
  const counter = {
    kind: 'limit' as const,
    isDefault: true,
    limitValue: quotaLimitDefault.limitValue,
    unit: quotaLimitDefault.unit,
    resourceType: quotaLimitDefault.resourceType,
    periodUnit: quotaLimitDefault.periodUnit,
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    spenderType: quotaLimitDefault.spenderType,
    spenderId: normalizeSpenderId(spenderId),
    operationType: quotaLimitDefault.operationType,
  };

  return { ...counter, key: buildQuotaCounterKey({ workspaceId, counter }) };
};
