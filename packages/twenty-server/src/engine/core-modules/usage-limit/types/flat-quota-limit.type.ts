import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';

export type FlatQuotaLimit = FlatUsageLimit & {
  limitKind: 'quota';
};
