import { type FlatQuotaLimit } from 'src/engine/core-modules/usage-limit/types/flat-quota-limit.type';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { isQuotaMeter } from 'src/engine/core-modules/usage-limit/utils/is-quota-meter.util';

export const isQuotaLimit = (limit: FlatUsageLimit): limit is FlatQuotaLimit =>
  limit.limitKind === 'quota' && isQuotaMeter(limit.meter);
