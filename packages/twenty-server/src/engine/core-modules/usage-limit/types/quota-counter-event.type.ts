import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';

export type QuotaCounterEvent = Pick<
  RecordUsageInput,
  'resourceType' | 'operationType' | 'spenders'
>;
