import { extractOrderByFieldNames } from '@/object-record/graphql/utils/extractOrderByFieldNames';
import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';

describe('extractOrderByFieldNames', () => {
  it('should always include the id field', () => {
    expect(extractOrderByFieldNames([])).toEqual({ id: true });
  });

  it('should extract top-level field names', () => {
    const orderBy: RecordGqlOperationOrderBy = [
      { createdAt: 'AscNullsFirst' },
      { name: 'DescNullsLast' },
    ];

    expect(extractOrderByFieldNames(orderBy)).toEqual({
      id: true,
      createdAt: true,
      name: true,
    });
  });

  it('should extract nested composite sub-field names', () => {
    const orderBy: RecordGqlOperationOrderBy = [
      { name: { firstName: 'AscNullsFirst', lastName: 'DescNullsLast' } },
    ];

    expect(extractOrderByFieldNames(orderBy)).toEqual({
      id: true,
      name: { firstName: true, lastName: true },
    });
  });

  it('should ignore nested values that are not directions', () => {
    const orderBy = [
      { name: { firstName: 'AscNullsFirst', meta: 'Unknown' } },
    ] as unknown as RecordGqlOperationOrderBy;

    expect(extractOrderByFieldNames(orderBy)).toEqual({
      id: true,
      name: { firstName: true },
    });
  });
});
