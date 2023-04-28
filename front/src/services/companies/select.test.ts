import { CompaniesSelectedSortType, reduceSortsToOrderBy } from './select';

describe('reduceSortsToOrderBy', () => {
  it('should return an array of objects with the id as key and the order as value', () => {
    const sorts = [
      { key: 'name', label: 'name', order: 'asc' },
      { key: 'domain_name', label: 'domain_name', order: 'desc' },
    ] satisfies CompaniesSelectedSortType[];
    const result = reduceSortsToOrderBy(sorts);
    expect(result).toEqual([{ name: 'asc', domain_name: 'desc' }]);
  });
});
