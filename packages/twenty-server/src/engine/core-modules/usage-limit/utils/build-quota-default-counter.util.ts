import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type QuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/quota-limit-default.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';
import { buildQuotaCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-counter-key.util';

export const buildQuotaDefaultCounter = ({
  workspaceId,
  quotaLimitDefault,
  period,
  isEnforced,
}: {
  workspaceId: string;
  quotaLimitDefault: QuotaLimitDefault;
  period: UsagePeriod;
  isEnforced: boolean;
}): LimitQuotaCounter => {
  const counter = {
    kind: 'limit' as const,
    usageLimitId: null,
    isDefault: true,
    isEnforced,
    limitValue: quotaLimitDefault.limitValue,
    unit: quotaLimitDefault.unit,
    resourceType: quotaLimitDefault.resourceType,
    periodUnit: quotaLimitDefault.periodUnit,
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    spenderType: quotaLimitDefault.spenderType,
    spenderId: null,
    operationType: quotaLimitDefault.operationType,
  };

  return { ...counter, key: buildQuotaCounterKey({ workspaceId, counter }) };
};
