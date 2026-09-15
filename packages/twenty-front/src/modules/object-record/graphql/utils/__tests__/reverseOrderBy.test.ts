import { reverseOrderBy } from '@/object-record/graphql/utils/reverseOrderBy';
import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';

describe('reverseOrderBy', () => {
  it('should reverse top-level directions', () => {
    const orderBy: RecordGqlOperationOrderBy = [
      { createdAt: 'AscNullsFirst' },
      { name: 'DescNullsLast' },
    ];

    expect(reverseOrderBy(orderBy)).toEqual([
      { createdAt: 'DescNullsLast' },
      { name: 'AscNullsFirst' },
    ]);
  });

  it('should reverse all direction variants', () => {
    const orderBy: RecordGqlOperationOrderBy = [
      { a: 'AscNullsFirst' },
      { b: 'AscNullsLast' },
      { c: 'DescNullsFirst' },
      { d: 'DescNullsLast' },
    ];

    expect(reverseOrderBy(orderBy)).toEqual([
      { a: 'DescNullsLast' },
      { b: 'DescNullsFirst' },
      { c: 'AscNullsLast' },
      { d: 'AscNullsFirst' },
    ]);
  });

  it('should reverse nested composite field directions', () => {
    const orderBy: RecordGqlOperationOrderBy = [
      { name: { firstName: 'AscNullsFirst', lastName: 'DescNullsLast' } },
    ];

    expect(reverseOrderBy(orderBy)).toEqual([
      { name: { firstName: 'DescNullsLast', lastName: 'AscNullsFirst' } },
    ]);
  });

  it('should leave unknown values untouched', () => {
    const orderBy = [
      { name: 'Unknown' },
    ] as unknown as RecordGqlOperationOrderBy;

    expect(reverseOrderBy(orderBy)).toEqual([{ name: 'Unknown' }]);
  });
});
