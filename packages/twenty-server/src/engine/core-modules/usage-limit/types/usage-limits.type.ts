import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';

export type UsageLimits = {
  byResourceType: Partial<Record<UsageResourceType, FlatUsageLimit[]>>;
};
