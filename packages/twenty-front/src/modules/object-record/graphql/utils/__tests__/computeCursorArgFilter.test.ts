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

  it('should treat a missing composite parent as a NULL cursor value', () => {
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
        { name: { firstName: { is: 'NOT_NULL' } } },
        {
          and: [
            { name: { firstName: { is: 'NULL' } } },
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
        { or: [{ score: { lt: 42 } }, { score: { is: 'NULL' } }] },
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

  it('should compare a BOOLEAN field with eq instead of gt when scanning forward', () => {
    const orderBy: RecordGqlOperationOrderBy = [{ isActive: 'AscNullsFirst' }];

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: { isActive: false, id: 'record-1' },
      isForwardPagination: true,
    });

    expect(result).toEqual({
      or: [
        { isActive: { eq: true } },
        {
          and: [{ isActive: { eq: false } }, { id: { gt: 'record-1' } }],
        },
      ],
    });
  });

  it('should compare a BOOLEAN field with eq instead of lt when scanning backward', () => {
    const orderBy: RecordGqlOperationOrderBy = [{ isActive: 'AscNullsFirst' }];

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: { isActive: true, id: 'record-1' },
      isForwardPagination: false,
    });

    expect(result).toEqual({
      or: [
        { or: [{ isActive: { eq: false } }, { isActive: { is: 'NULL' } }] },
        {
          and: [{ isActive: { eq: true } }, { id: { lt: 'record-1' } }],
        },
      ],
    });
  });

  it('should drop the branch of a BOOLEAN field already on the last scanned value', () => {
    const orderBy: RecordGqlOperationOrderBy = [{ isActive: 'AscNullsFirst' }];

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: { isActive: true, id: 'record-1' },
      isForwardPagination: true,
    });

    expect(result).toEqual({
      or: [
        {
          and: [{ isActive: { eq: true } }, { id: { gt: 'record-1' } }],
        },
      ],
    });
  });

  it('should scan a descending BOOLEAN field towards false', () => {
    const orderBy: RecordGqlOperationOrderBy = [{ isActive: 'DescNullsFirst' }];

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: { isActive: true, id: 'record-1' },
      isForwardPagination: true,
    });

    expect(result).toEqual({
      or: [
        { isActive: { eq: false } },
        {
          and: [{ isActive: { eq: true } }, { id: { gt: 'record-1' } }],
        },
      ],
    });
  });

  it('should keep the equality prefixes of a dropped BOOLEAN branch on the following fields', () => {
    const orderBy: RecordGqlOperationOrderBy = [
      { isActive: 'AscNullsFirst' },
      { createdAt: 'DescNullsFirst' },
    ];

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: {
        isActive: true,
        createdAt: '2024-01-01',
        id: 'record-1',
      },
      isForwardPagination: true,
    });

    expect(result).toEqual({
      or: [
        {
          and: [
            { isActive: { eq: true } },
            { createdAt: { lt: '2024-01-01' } },
          ],
        },
        {
          and: [
            { isActive: { eq: true } },
            { createdAt: { eq: '2024-01-01' } },
            { id: { gt: 'record-1' } },
          ],
        },
      ],
    });
  });

  it('should reach the trailing NULL block of a BOOLEAN field on its last value', () => {
    const orderBy: RecordGqlOperationOrderBy = [{ isActive: 'AscNullsLast' }];

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: { isActive: true, id: 'record-1' },
      isForwardPagination: true,
    });

    expect(result).toEqual({
      or: [
        { isActive: { is: 'NULL' } },
        {
          and: [{ isActive: { eq: true } }, { id: { gt: 'record-1' } }],
        },
      ],
    });
  });

  it('should scan out of the leading NULL block of a BOOLEAN field', () => {
    const orderBy: RecordGqlOperationOrderBy = [{ isActive: 'AscNullsFirst' }];

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: { isActive: null, id: 'record-1' },
      isForwardPagination: true,
    });

    expect(result).toEqual({
      or: [
        { isActive: { is: 'NOT_NULL' } },
        {
          and: [{ isActive: { is: 'NULL' } }, { id: { gt: 'record-1' } }],
        },
      ],
    });
  });

  it('should only advance on the tie-breaker inside the trailing NULL block', () => {
    const orderBy: RecordGqlOperationOrderBy = [{ isActive: 'AscNullsLast' }];

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: { isActive: null, id: 'record-1' },
      isForwardPagination: true,
    });

    expect(result).toEqual({
      or: [
        {
          and: [{ isActive: { is: 'NULL' } }, { id: { gt: 'record-1' } }],
        },
      ],
    });
  });

  const ORDER_BY_DIRECTIONS = [
    'AscNullsFirst',
    'AscNullsLast',
    'DescNullsFirst',
    'DescNullsLast',
  ] as const;

  const BOOLEAN_CURSOR_CASES = ORDER_BY_DIRECTIONS.flatMap((direction) =>
    [true, false, null].flatMap((cursorValue) =>
      [true, false].map((isForwardPagination) => ({
        direction,
        cursorValue,
        isForwardPagination,
      })),
    ),
  );

  it.each(BOOLEAN_CURSOR_CASES)(
    'should never emit an operator a BOOLEAN field rejects ($direction, cursor $cursorValue, forward $isForwardPagination)',
    ({ direction, cursorValue, isForwardPagination }) => {
      const result = computeCursorArgFilter({
        orderBy: [{ isActive: direction }] as RecordGqlOperationOrderBy,
        cursorRecordValues: { isActive: cursorValue, id: 'record-1' },
        isForwardPagination,
      });

      expect(JSON.stringify(result)).not.toMatch(
        /"isActive":\{"(gt|gte|lt|lte)"/,
      );
    },
  );
});
