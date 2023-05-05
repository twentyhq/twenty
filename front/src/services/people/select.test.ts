import { reduceSortsToOrderBy } from '../../components/table/table-header/helpers';
import { PeopleSelectedSortType } from './select';

describe('reduceSortsToOrderBy', () => {
  it('should return an array of objects with the id as key and the order as value', () => {
    const sorts = [
      {
        key: 'firstname',
        label: 'firstname',
        order: 'asc',
        _type: 'default_sort',
      },
      {
        key: 'lastname',
        label: 'lastname',
        order: 'desc',
        _type: 'default_sort',
      },
    ] satisfies PeopleSelectedSortType[];
    const result = reduceSortsToOrderBy(sorts);
    expect(result).toEqual([{ firstname: 'asc' }, { lastname: 'desc' }]);
  });
});
