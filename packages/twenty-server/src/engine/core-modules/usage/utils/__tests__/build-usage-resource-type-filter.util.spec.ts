import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { buildUsageResourceTypeFilter } from 'src/engine/core-modules/usage/utils/build-usage-resource-type-filter.util';

describe('buildUsageResourceTypeFilter', () => {
  it('pins the resource when the scope names one', () => {
    expect(buildUsageResourceTypeFilter(UsageResourceType.AI)).toEqual({
      clause: 'AND resourceType = {resourceType:String}',
      params: { resourceType: UsageResourceType.AI },
    });
  });

  it('narrows nothing for a scope over every resource', () => {
    expect(buildUsageResourceTypeFilter(UsageResourceType.ALL)).toEqual({
      clause: '',
      params: {},
    });
  });
});
