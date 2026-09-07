import { type UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';

export const fromUsageLimitEntityToFlat = (
  usageLimit: UsageLimitEntity,
): FlatUsageLimit => ({
  id: usageLimit.id,
  resourceType: usageLimit.resourceType,
  operationType: usageLimit.operationType,
  spenderType: usageLimit.spenderType,
  spenderId: usageLimit.spenderId,
  limitKind: usageLimit.limitKind,
  periodCount: usageLimit.periodCount,
  periodUnit: usageLimit.periodUnit,
  meter: usageLimit.meter,
  limitValue: usageLimit.limitValue,
  burstValue: usageLimit.burstValue,
});
