import { reduceSortsToOrderBy } from './select';

describe('reduceSortsToOrderBy', () => {
  it('should return an array of objects with the id as key and the order as value', () => {
    const sorts = [
      { id: 'firstname', order: 'asc' },
      { id: 'lastname', order: 'desc' },
    ] satisfies { order: 'asc' | 'desc'; id: string }[];
    const result = reduceSortsToOrderBy(sorts);
    expect(result).toEqual([{ firstname: 'asc', lastname: 'desc' }]);
  });
});
