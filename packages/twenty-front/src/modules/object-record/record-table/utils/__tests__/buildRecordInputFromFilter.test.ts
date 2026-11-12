import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { buildRecordInputFromFilter } from '@/object-record/record-table/utils/buildRecordInputFromFilter';
import {
  FieldMetadataType,
  RelationType,
  ViewFilterOperand,
} from 'twenty-shared/types';

const FIELD_ID_TEXT = 'field-text-id';
const FIELD_ID_DATE_TIME = 'field-date-time-id';
const FIELD_ID_ADDRESS = 'field-address-id';
const FIELD_ID_NUMBER = 'field-number-id';
const FIELD_ID_RELATION = 'field-relation-id';
const FIELD_ID_UNKNOWN = 'field-unknown-id';

const mockObjectMetadataItem = {
  fields: [
    {
      id: FIELD_ID_TEXT,
      name: 'companyName',
      type: FieldMetadataType.TEXT,
      options: null,
    },
    {
      id: FIELD_ID_RELATION,
      name: 'company',
      type: FieldMetadataType.RELATION,
      options: null,
      relation: { type: RelationType.MANY_TO_ONE },
    },
    {
      id: FIELD_ID_DATE_TIME,
      name: 'createdAt',
      type: FieldMetadataType.DATE_TIME,
      options: null,
    },
    {
      id: FIELD_ID_ADDRESS,
      name: 'address',
      type: FieldMetadataType.ADDRESS,
      options: null,
    },
    {
      id: FIELD_ID_NUMBER,
      name: 'revenue',
      type: FieldMetadataType.NUMBER,
      options: null,
    },
  ],
};

const createFilter = (
  overrides: Partial<RecordFilter> & Pick<RecordFilter, 'fieldMetadataId'>,
): RecordFilter => ({
  id: 'filter-id',
  value: '',
  displayValue: '',
  type: FieldMetadataType.TEXT,
  operand: ViewFilterOperand.CONTAINS,
  label: 'Test',
  ...overrides,
});

describe('buildRecordInputFromFilter', () => {
  it('should assign text value directly without merging', () => {
    const result = buildRecordInputFromFilter({
      currentRecordFilters: [
        createFilter({
          fieldMetadataId: FIELD_ID_TEXT,
          type: FieldMetadataType.TEXT,
          operand: ViewFilterOperand.CONTAINS,
          value: 'Acme',
        }),
      ],
      objectMetadataItem: mockObjectMetadataItem,
      timeZone: 'UTC',
    });

    expect(result).toEqual({ companyName: 'Acme' });
  });

  it('should subtract one minute for DATE_TIME with IS_BEFORE operand', () => {
    const filterDate = new Date('2025-06-15T10:30:00.000Z');

    const result = buildRecordInputFromFilter({
      currentRecordFilters: [
        createFilter({
          fieldMetadataId: FIELD_ID_DATE_TIME,
          type: FieldMetadataType.DATE_TIME,
          operand: ViewFilterOperand.IS_BEFORE,
          value: filterDate.toISOString(),
        }),
      ],
      objectMetadataItem: mockObjectMetadataItem,
      timeZone: 'UTC',
    });

    expect(typeof result.createdAt).toBe('string');
    expect(new Date(result.createdAt as string).getTime()).toBe(
      new Date('2025-06-15T10:29:00.000Z').getTime(),
    );
  });

  it('should not subtract a minute for DATE_TIME with IS operand', () => {
    const filterDate = new Date('2025-06-15T10:30:00.000Z');

    const result = buildRecordInputFromFilter({
      currentRecordFilters: [
        createFilter({
          fieldMetadataId: FIELD_ID_DATE_TIME,
          type: FieldMetadataType.DATE_TIME,
          operand: ViewFilterOperand.IS,
          value: filterDate.toISOString(),
        }),
      ],
      objectMetadataItem: mockObjectMetadataItem,
      timeZone: 'UTC',
    });

    expect(typeof result.createdAt).toBe('string');
    expect(new Date(result.createdAt as string).getTime()).toBe(
      filterDate.getTime(),
    );
  });

  it('should assign an ISO string (not a Date) for DATE_TIME with IS_RELATIVE operand', () => {
    const result = buildRecordInputFromFilter({
      currentRecordFilters: [
        createFilter({
          fieldMetadataId: FIELD_ID_DATE_TIME,
          type: FieldMetadataType.DATE_TIME,
          operand: ViewFilterOperand.IS_RELATIVE,
          value: 'THIS_QUARTER',
        }),
      ],
      objectMetadataItem: mockObjectMetadataItem,
      timeZone: 'UTC',
    });

    expect(typeof result.createdAt).toBe('string');
    expect(() =>
      new Date(result.createdAt as string).toISOString(),
    ).not.toThrow();
  });

  it('should deep-merge a single composite address sub-field starting from empty object', () => {
    const result = buildRecordInputFromFilter({
      currentRecordFilters: [
        createFilter({
          fieldMetadataId: FIELD_ID_ADDRESS,
          type: FieldMetadataType.ADDRESS,
          operand: ViewFilterOperand.CONTAINS,
          value: 'Paris',
          subFieldName: 'addressCity',
        }),
      ],
      objectMetadataItem: mockObjectMetadataItem,
      timeZone: 'UTC',
    });

    expect(result.address).toEqual({ addressCity: 'Paris' });
  });

  it('should merge composite address sub-fields into a single object', () => {
    const result = buildRecordInputFromFilter({
      currentRecordFilters: [
        createFilter({
          fieldMetadataId: FIELD_ID_ADDRESS,
          type: FieldMetadataType.ADDRESS,
          operand: ViewFilterOperand.CONTAINS,
          value: 'Paris',
          subFieldName: 'addressCity',
        }),
        createFilter({
          id: 'filter-id-2',
          fieldMetadataId: FIELD_ID_ADDRESS,
          type: FieldMetadataType.ADDRESS,
          operand: ViewFilterOperand.CONTAINS,
          value: 'France',
          subFieldName: 'addressCountry',
        }),
      ],
      objectMetadataItem: mockObjectMetadataItem,
      timeZone: 'UTC',
    });

    expect(result.address).toEqual({
      addressCity: 'Paris',
      addressCountry: 'France',
    });
  });

  it('should skip filters with no matching field metadata', () => {
    const result = buildRecordInputFromFilter({
      currentRecordFilters: [
        createFilter({
          fieldMetadataId: FIELD_ID_UNKNOWN,
          type: FieldMetadataType.TEXT,
          operand: ViewFilterOperand.CONTAINS,
          value: 'something',
        }),
      ],
      objectMetadataItem: mockObjectMetadataItem,
      timeZone: 'UTC',
    });

    expect(result).toEqual({});
  });

  it('should skip filters where buildValueFromFilter returns undefined', () => {
    const result = buildRecordInputFromFilter({
      currentRecordFilters: [
        createFilter({
          fieldMetadataId: FIELD_ID_TEXT,
          type: FieldMetadataType.TEXT,
          operand: ViewFilterOperand.IS_EMPTY,
          value: '',
        }),
      ],
      objectMetadataItem: mockObjectMetadataItem,
      timeZone: 'UTC',
    });

    expect(result).toEqual({});
  });

  it('should assign number value directly without merging', () => {
    const result = buildRecordInputFromFilter({
      currentRecordFilters: [
        createFilter({
          fieldMetadataId: FIELD_ID_NUMBER,
          type: FieldMetadataType.NUMBER,
          operand: ViewFilterOperand.IS,
          value: '42',
        }),
      ],
      objectMetadataItem: mockObjectMetadataItem,
      timeZone: 'UTC',
    });

    expect(result).toEqual({ revenue: 42 });
  });

  it('should prefill the join column for a direct relation filter on the current record', () => {
    const result = buildRecordInputFromFilter({
      currentRecordFilters: [
        createFilter({
          fieldMetadataId: FIELD_ID_RELATION,
          type: FieldMetadataType.RELATION,
          operand: ViewFilterOperand.IS,
          value: JSON.stringify({
            isCurrentRecordSelected: true,
            selectedRecordIds: [],
          }),
        }),
      ],
      objectMetadataItem: mockObjectMetadataItem,
      currentRecordId: 'current-record-id',
      timeZone: 'UTC',
    });

    expect(result).toEqual({ companyId: 'current-record-id' });
  });

  it('should skip relation traversal filters instead of prefilling the join column', () => {
    const result = buildRecordInputFromFilter({
      currentRecordFilters: [
        createFilter({
          fieldMetadataId: FIELD_ID_RELATION,
          type: FieldMetadataType.RELATION,
          operand: ViewFilterOperand.IS,
          value: JSON.stringify({
            isCurrentRecordSelected: true,
            selectedRecordIds: [],
          }),
          relationTargetFieldMetadataId: 'relation-target-field-id',
        }),
      ],
      objectMetadataItem: mockObjectMetadataItem,
      currentRecordId: 'current-record-id',
      timeZone: 'UTC',
    });

    expect(result).toEqual({});
  });
});
