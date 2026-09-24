import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type QuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/quota-limit-default.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';
import { buildQuotaDefaultCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-default-counter-key.util';

export const buildQuotaDefaultCounter = ({
  workspaceId,
  quotaLimitDefault,
  period,
}: {
  workspaceId: string;
  quotaLimitDefault: QuotaLimitDefault;
  period: UsagePeriod;
}): LimitQuotaCounter => ({
  kind: 'limit',
  isDefault: true,
  key: buildQuotaDefaultCounterKey({
    workspaceId,
    resourceType: quotaLimitDefault.resourceType,
    operationType: quotaLimitDefault.operationType,
    spenderType: quotaLimitDefault.spenderType,
    meter: quotaLimitDefault.meter,
    periodUnit: quotaLimitDefault.periodUnit,
    periodStart: period.periodStart,
    limitValue: quotaLimitDefault.limitValue,
  }),
  limitValue: quotaLimitDefault.limitValue,
  meter: quotaLimitDefault.meter,
  resourceType: quotaLimitDefault.resourceType,
  periodUnit: quotaLimitDefault.periodUnit,
  periodStart: period.periodStart,
  periodEnd: period.periodEnd,
  spenderType: quotaLimitDefault.spenderType,
  spenderId: null,
  operationType: quotaLimitDefault.operationType,
});
