import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type QuotaMeter } from 'src/engine/core-modules/usage-limit/types/quota-meter.type';

export type FlatQuotaLimit = Omit<FlatUsageLimit, 'meter'> & {
  meter: QuotaMeter;
};
