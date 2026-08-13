import {
  FieldMetadataType,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { computeCursorArgFilter } from '@/object-record/graphql/utils/computeCursorArgFilter';

const buildOptionBackedField = ({
  name,
  type,
  optionValuesByPosition,
}: {
  name: string;
  type: FieldMetadataType;
  optionValuesByPosition: string[];
}): Pick<FieldMetadataItem, 'name' | 'type' | 'options'> => ({
  name,
  type,
  options: optionValuesByPosition.map((value, position) => ({
    id: `${name}-option-${position}`,
    label: value,
    value,
    position,
    color: 'blue',
  })),
});

const stageField = buildOptionBackedField({
  name: 'stage',
  type: FieldMetadataType.SELECT,
  optionValuesByPosition: [
    'NEW',
    'SCREENING',
    'MEETING',
    'PROPOSAL',
    'CUSTOMER',
  ],
});

describe('computeCursorArgFilter', () => {
  it('should append an id tie-breaker when ordering does not include id', () => {
    const orderBy: RecordGqlOperationOrderBy = [{ createdAt: 'AscNullsFirst' }];

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: { createdAt: '2024-01-01', id: 'record-1' },
      isForwardPagination: true,
      fieldMetadataItems: [],
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
      fieldMetadataItems: [],
    });

    expect(result).toEqual({ or: [{ id: { gt: 'record-1' } }] });
  });

  it('should use lt operator for ascending order with backward pagination', () => {
    const orderBy: RecordGqlOperationOrderBy = [{ id: 'AscNullsLast' }];

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: { id: 'record-1' },
      isForwardPagination: false,
      fieldMetadataItems: [],
    });

    expect(result).toEqual({ or: [{ id: { lt: 'record-1' } }] });
  });

  it('should use lt operator for descending order with forward pagination', () => {
    const orderBy: RecordGqlOperationOrderBy = [{ id: 'DescNullsFirst' }];

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: { id: 'record-1' },
      isForwardPagination: true,
      fieldMetadataItems: [],
    });

    expect(result).toEqual({ or: [{ id: { lt: 'record-1' } }] });
  });

  it('should use gt operator for descending order with backward pagination', () => {
    const orderBy: RecordGqlOperationOrderBy = [{ id: 'DescNullsLast' }];

    const result = computeCursorArgFilter({
      orderBy,
      cursorRecordValues: { id: 'record-1' },
      isForwardPagination: false,
      fieldMetadataItems: [],
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
      fieldMetadataItems: [],
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
      fieldMetadataItems: [],
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
      fieldMetadataItems: [],
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
      fieldMetadataItems: [],
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
      fieldMetadataItems: [],
    });

    expect(result).toEqual({ or: [{ id: { gt: 'record-1' } }] });
  });

  describe('option-backed fields (select, rating)', () => {
    it('should use an in list of options past the cursor for ascending forward pagination', () => {
      const orderBy: RecordGqlOperationOrderBy = [{ stage: 'AscNullsFirst' }];

      const result = computeCursorArgFilter({
        orderBy,
        cursorRecordValues: { stage: 'MEETING', id: 'record-1' },
        isForwardPagination: true,
        fieldMetadataItems: [stageField],
      });

      expect(result).toEqual({
        or: [
          { stage: { in: ['PROPOSAL', 'CUSTOMER'] } },
          {
            and: [{ stage: { eq: 'MEETING' } }, { id: { gt: 'record-1' } }],
          },
        ],
      });
    });

    it('should use an in list of options before the cursor for ascending backward pagination', () => {
      const orderBy: RecordGqlOperationOrderBy = [{ stage: 'AscNullsFirst' }];

      const result = computeCursorArgFilter({
        orderBy,
        cursorRecordValues: { stage: 'MEETING', id: 'record-1' },
        isForwardPagination: false,
        fieldMetadataItems: [stageField],
      });

      expect(result).toEqual({
        or: [
          { stage: { in: ['NEW', 'SCREENING'] } },
          {
            and: [{ stage: { eq: 'MEETING' } }, { id: { lt: 'record-1' } }],
          },
        ],
      });
    });

    it('should order options by position and not by declaration order', () => {
      const shuffledStageField = {
        ...stageField,
        options: [...(stageField.options ?? [])].reverse(),
      };

      const orderBy: RecordGqlOperationOrderBy = [{ stage: 'AscNullsFirst' }];

      const result = computeCursorArgFilter({
        orderBy,
        cursorRecordValues: { stage: 'MEETING', id: 'record-1' },
        isForwardPagination: true,
        fieldMetadataItems: [shuffledStageField],
      });

      expect(result).toEqual({
        or: [
          { stage: { in: ['PROPOSAL', 'CUSTOMER'] } },
          {
            and: [{ stage: { eq: 'MEETING' } }, { id: { gt: 'record-1' } }],
          },
        ],
      });
    });

    it('should drop the comparison branch when the cursor is on the last option', () => {
      const orderBy: RecordGqlOperationOrderBy = [{ stage: 'AscNullsFirst' }];

      const result = computeCursorArgFilter({
        orderBy,
        cursorRecordValues: { stage: 'CUSTOMER', id: 'record-1' },
        isForwardPagination: true,
        fieldMetadataItems: [stageField],
      });

      expect(result).toEqual({
        or: [
          {
            and: [{ stage: { eq: 'CUSTOMER' } }, { id: { gt: 'record-1' } }],
          },
        ],
      });
    });

    it('should drop the comparison branch when the cursor value is null', () => {
      const orderBy: RecordGqlOperationOrderBy = [{ stage: 'AscNullsFirst' }];

      const result = computeCursorArgFilter({
        orderBy,
        cursorRecordValues: { stage: null, id: 'record-1' },
        isForwardPagination: true,
        fieldMetadataItems: [stageField],
      });

      expect(result).toEqual({
        or: [
          {
            and: [{ stage: { eq: null } }, { id: { gt: 'record-1' } }],
          },
        ],
      });
    });

    it('should drop the comparison branch when the cursor value is not a known option', () => {
      const orderBy: RecordGqlOperationOrderBy = [{ stage: 'AscNullsFirst' }];

      const result = computeCursorArgFilter({
        orderBy,
        cursorRecordValues: { stage: 'DELETED_OPTION', id: 'record-1' },
        isForwardPagination: true,
        fieldMetadataItems: [stageField],
      });

      expect(result).toEqual({
        or: [
          {
            and: [
              { stage: { eq: 'DELETED_OPTION' } },
              { id: { gt: 'record-1' } },
            ],
          },
        ],
      });
    });

    it('should apply the in list to rating fields', () => {
      const ratingField = buildOptionBackedField({
        name: 'priority',
        type: FieldMetadataType.RATING,
        optionValuesByPosition: [
          'RATING_1',
          'RATING_2',
          'RATING_3',
          'RATING_4',
          'RATING_5',
        ],
      });

      const orderBy: RecordGqlOperationOrderBy = [
        { priority: 'DescNullsLast' },
      ];

      const result = computeCursorArgFilter({
        orderBy,
        cursorRecordValues: { priority: 'RATING_4', id: 'record-1' },
        isForwardPagination: true,
        fieldMetadataItems: [ratingField],
      });

      expect(result).toEqual({
        or: [
          { priority: { in: ['RATING_1', 'RATING_2', 'RATING_3'] } },
          {
            and: [{ priority: { eq: 'RATING_4' } }, { id: { gt: 'record-1' } }],
          },
        ],
      });
    });
  });
});
