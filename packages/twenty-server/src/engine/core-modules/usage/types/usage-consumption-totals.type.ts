import { type UsageConsumptionRow } from 'src/engine/core-modules/usage/types/usage-consumption-row.type';

export type UsageConsumptionTotals = Pick<
  UsageConsumptionRow,
  'creditsUsedMicro' | 'quantity'
>;
