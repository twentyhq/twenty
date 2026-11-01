import { type FlatQuotaLimit } from 'src/engine/core-modules/usage-limit/types/flat-quota-limit.type';
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
  limit: Omit<FlatQuotaLimit, 'limitKind' | 'periodCount' | 'burstValue'>;
  period: UsagePeriod;
}): LimitQuotaCounter => {
  const counter: Omit<LimitQuotaCounter, 'key'> = {
    kind: 'limit',
    isDefault: false,
    limitValue: limit.limitValue,
    unit: limit.unit,
    resourceType: limit.resourceType,
    periodUnit: limit.periodUnit,
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    spenderType: limit.spenderType,
    spenderId: normalizeSpenderId(limit.spenderId),
    operationTypes: [limit.operationType],
  };

  return { ...counter, key: buildQuotaCounterKey({ workspaceId, counter }) };
};
