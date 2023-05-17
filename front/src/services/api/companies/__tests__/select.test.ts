import { reduceSortsToOrderBy } from '../../../../components/table/table-header/helpers';
import { CompaniesSelectedSortType } from '../select';

describe('reduceSortsToOrderBy', () => {
  it('should return an array of objects with the id as key and the order as value', () => {
    const sorts = [
      { key: 'name', label: 'name', order: 'asc', _type: 'default_sort' },
      {
        key: 'domain_name',
        label: 'domain_name',
        order: 'desc',
        _type: 'default_sort',
      },
    ] satisfies CompaniesSelectedSortType[];
    const result = reduceSortsToOrderBy(sorts);
    expect(result).toEqual([{ name: 'asc' }, { domain_name: 'desc' }]);
  });
});
