import { reduceSortsToOrderBy } from '@/ui/filter-n-sort/helpers';

import { PeopleSelectedSortType } from '../select';

describe('reduceSortsToOrderBy', () => {
  it('should return an array of objects with the id as key and the order as value', () => {
    const sorts = [
      {
        key: 'firstName',
        label: 'firstName',
        order: 'asc',
      },
      {
        key: 'lastName',
        label: 'lastName',
        order: 'desc',
      },
    ] satisfies PeopleSelectedSortType[];
    const result = reduceSortsToOrderBy(sorts);
    expect(result).toEqual([{ firstName: 'asc' }, { lastName: 'desc' }]);
  });
});
