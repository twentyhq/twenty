import { type FlatQuotaLimit } from 'src/engine/core-modules/usage-limit/types/flat-quota-limit.type';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';

export const isQuotaLimit = (limit: FlatUsageLimit): limit is FlatQuotaLimit =>
  limit.limitKind === 'quota';
