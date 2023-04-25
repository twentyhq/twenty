import { PeopleSelectedSortType, reduceSortsToOrderBy } from './select';

describe('reduceSortsToOrderBy', () => {
  it('should return an array of objects with the id as key and the order as value', () => {
    const sorts = [
      { id: 'firstname', label: 'firstname', order: 'asc' },
      { id: 'lastname', label: 'lastname', order: 'desc' },
    ] satisfies PeopleSelectedSortType[];
    const result = reduceSortsToOrderBy(sorts);
    expect(result).toEqual([{ firstname: 'asc', lastname: 'desc' }]);
  });
});
