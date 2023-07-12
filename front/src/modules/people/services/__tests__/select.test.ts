import { reduceSortsToOrderBy } from '@/lib/filters-and-sorts/helpers';

import { PeopleSelectedSortType } from '../select';

describe('reduceSortsToOrderBy', () => {
  it('should return an array of objects with the id as key and the order as value', () => {
    const sorts = [
      {
        key: 'firstName',
        label: 'firstName',
        order: 'asc',
        _type: 'default_sort',
      },
      {
        key: 'lastName',
        label: 'lastName',
        order: 'desc',
        _type: 'default_sort',
      },
    ] satisfies PeopleSelectedSortType[];
    const result = reduceSortsToOrderBy(sorts);
    expect(result).toEqual([{ firstName: 'asc' }, { lastName: 'desc' }]);
  });
});
