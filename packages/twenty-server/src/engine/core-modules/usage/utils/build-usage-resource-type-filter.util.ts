import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsageScopeFilter } from 'src/engine/core-modules/usage/utils/build-usage-scope-filter.util';

export const buildUsageResourceTypeFilter = (
  resourceType: UsageResourceType,
): UsageScopeFilter =>
  resourceType === UsageResourceType.ALL
    ? { clause: '', params: {} }
    : {
        clause: 'AND resourceType = {resourceType:String}',
        params: { resourceType },
      };
