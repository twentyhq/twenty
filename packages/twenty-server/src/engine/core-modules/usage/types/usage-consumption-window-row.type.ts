import { type UsageConsumptionRow } from 'src/engine/core-modules/usage/types/usage-consumption-row.type';

export type UsageConsumptionWindowRow = UsageConsumptionRow & {
  windowKey: string;
  resourceType: string;
};
