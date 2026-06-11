import { computeCursorArgFilter } from '@/object-record/graphql/utils/computeCursorArgFilter';
import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';

describe('computeCursorArgFilter', () => {
  it('should append an id tie-breaker when ordering does not include id', () => {
    const orderBy: RecordGqlOperationOrderBy = [{ createdAt: 'AscNullsFirst' }];

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: { createdAt: '2024-01-01', id: 'record-1' },
      isForwardPagination: true,
    });

    expect(result).toEqual({
      or: [
        { createdAt: { gt: '2024-01-01' } },
        {
          and: [
            { createdAt: { eq: '2024-01-01' } },
            { id: { gt: 'record-1' } },
          ],
        },
      ],
    });
  });

  it('should not append an id field when it is already part of the ordering', () => {
    const orderBy: RecordGqlOperationOrderBy = [{ id: 'AscNullsFirst' }];

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: { id: 'record-1' },
      isForwardPagination: true,
    });

    expect(result).toEqual({ or: [{ id: { gt: 'record-1' } }] });
  });

  it('should use lt operator for ascending order with backward pagination', () => {
    const orderBy: RecordGqlOperationOrderBy = [{ id: 'AscNullsLast' }];

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: { id: 'record-1' },
      isForwardPagination: false,
    });

    expect(result).toEqual({ or: [{ id: { lt: 'record-1' } }] });
  });

  it('should use lt operator for descending order with forward pagination', () => {
    const orderBy: RecordGqlOperationOrderBy = [{ id: 'DescNullsFirst' }];

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: { id: 'record-1' },
      isForwardPagination: true,
    });

    expect(result).toEqual({ or: [{ id: { lt: 'record-1' } }] });
  });

  it('should use gt operator for descending order with backward pagination', () => {
    const orderBy: RecordGqlOperationOrderBy = [{ id: 'DescNullsLast' }];

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: { id: 'record-1' },
      isForwardPagination: false,
    });

    expect(result).toEqual({ or: [{ id: { gt: 'record-1' } }] });
  });

  it('should resolve nested composite sub-fields and read their cursor value', () => {
    const orderBy: RecordGqlOperationOrderBy = [
      { name: { firstName: 'AscNullsFirst' } },
    ];

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: { name: { firstName: 'John' }, id: 'record-1' },
      isForwardPagination: true,
    });

    expect(result).toEqual({
      or: [
        { name: { firstName: { gt: 'John' } } },
        {
          and: [
            { name: { firstName: { eq: 'John' } } },
            { id: { gt: 'record-1' } },
          ],
        },
      ],
    });
  });

  it('should fall back to undefined cursor value for missing composite parent', () => {
    const orderBy: RecordGqlOperationOrderBy = [
      { name: { firstName: 'AscNullsFirst' } },
    ];

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: { id: 'record-1' },
      isForwardPagination: true,
    });

    expect(result).toEqual({
      or: [
        { name: { firstName: { gt: undefined } } },
        {
          and: [
            { name: { firstName: { eq: undefined } } },
            { id: { gt: 'record-1' } },
          ],
        },
      ],
    });
  });

  it('should ignore nested values that are not order-by directions', () => {
    const orderBy = [
      { name: { firstName: 'AscNullsFirst', metadata: 'not-a-direction' } },
    ] as unknown as RecordGqlOperationOrderBy;

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: { name: { firstName: 'John' }, id: 'record-1' },
      isForwardPagination: true,
    });

    expect(result).toEqual({
      or: [
        { name: { firstName: { gt: 'John' } } },
        {
          and: [
            { name: { firstName: { eq: 'John' } } },
            { id: { gt: 'record-1' } },
          ],
        },
      ],
    });
  });

  it('should build cumulative equality prefixes across multiple fields', () => {
    const orderBy: RecordGqlOperationOrderBy = [
      { score: 'DescNullsLast' },
      { id: 'AscNullsFirst' },
    ];

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: { score: 42, id: 'record-1' },
      isForwardPagination: true,
    });

    expect(result).toEqual({
      or: [
        { score: { lt: 42 } },
        {
          and: [{ score: { eq: 42 } }, { id: { gt: 'record-1' } }],
        },
      ],
    });
  });

  it('should fall back to the id tie-breaker when there are no order-by fields', () => {
    const orderBy = [{}] as unknown as RecordGqlOperationOrderBy;

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: { id: 'record-1' },
      isForwardPagination: true,
    });

    expect(result).toEqual({ or: [{ id: { gt: 'record-1' } }] });
  });
});
