import { reduceSortsToOrderBy } from '@/ui/filter-n-sort/helpers';

import { CompaniesSelectedSortType } from '../select';

describe('reduceSortsToOrderBy', () => {
  it('should return an array of objects with the id as key and the order as value', () => {
    const sorts = [
      { key: 'name', label: 'name', order: 'asc' },
      {
        key: 'domainName',
        label: 'domainName',
        order: 'desc',
      },
    ] satisfies CompaniesSelectedSortType[];
    const result = reduceSortsToOrderBy(sorts);
    expect(result).toEqual([{ name: 'asc' }, { domainName: 'desc' }]);
  });
});
