import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { type QuotaCost } from 'src/engine/core-modules/usage-limit/types/quota-cost.type';

const addUsageEventToQuotaCost = (
  cost: QuotaCost,
  usageEvent: RecordUsageInput,
): QuotaCost => {
  const creditsUsedMicro =
    cost[UsageUnit.CREDIT] + (usageEvent.creditsUsedMicro ?? 0);

  if (usageEvent.unit === UsageUnit.CREDIT) {
    return { ...cost, [UsageUnit.CREDIT]: creditsUsedMicro };
  }

  return {
    ...cost,
    [usageEvent.unit]: (cost[usageEvent.unit] ?? 0) + usageEvent.quantity,
    [UsageUnit.CREDIT]: creditsUsedMicro,
  };
};

export const buildQuotaCostFromUsageEvents = (
  usageEvents: RecordUsageInput[],
): QuotaCost =>
  usageEvents.reduce<QuotaCost>(addUsageEventToQuotaCost, {
    [UsageUnit.CREDIT]: 0,
  });
