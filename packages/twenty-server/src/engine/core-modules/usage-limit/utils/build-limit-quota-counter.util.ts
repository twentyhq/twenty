import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';
import { buildQuotaCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-counter-key.util';
import { normalizeSpenderId } from 'src/engine/core-modules/usage-limit/utils/normalize-spender-id.util';

export const buildLimitQuotaCounter = ({
  workspaceId,
  limit,
  period,
}: {
  workspaceId: string;
  limit: Omit<
    FlatUsageLimit,
    'id' | 'limitKind' | 'periodCount' | 'burstValue'
  >;
  period: UsagePeriod;
}): LimitQuotaCounter => ({
  kind: 'limit',
  key: buildQuotaCounterKey({
    workspaceId,
    resourceType: limit.resourceType,
    operationType: limit.operationType,
    spenderType: limit.spenderType,
    spenderId: limit.spenderId,
    meter: limit.meter,
    periodUnit: limit.periodUnit,
    periodStart: period.periodStart,
  }),
  limitValue: limit.limitValue,
  meter: limit.meter,
  resourceType: limit.resourceType,
  periodUnit: limit.periodUnit,
  periodStart: period.periodStart,
  periodEnd: period.periodEnd,
  spenderType: limit.spenderType,
  spenderId: normalizeSpenderId(limit.spenderId),
  operationType: limit.operationType,
});
