import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { buildRecordInputFromFilter } from '@/object-record/record-table/utils/buildRecordInputFromFilter';
import { ViewFilterOperand } from 'twenty-shared/types';

const FIELD_ID_TEXT = 'field-text-id';
const FIELD_ID_DATE_TIME = 'field-date-time-id';
const FIELD_ID_ADDRESS = 'field-address-id';
const FIELD_ID_NUMBER = 'field-number-id';
const FIELD_ID_UNKNOWN = 'field-unknown-id';

const mockObjectMetadataItem = {
  fields: [
    {
      id: FIELD_ID_TEXT,
      name: 'companyName',
      type: 'TEXT',
      options: null,
    },
    {
      id: FIELD_ID_DATE_TIME,
      name: 'createdAt',
      type: 'DATE_TIME',
      options: null,
    },
    {
      id: FIELD_ID_ADDRESS,
      name: 'address',
      type: 'ADDRESS',
      options: null,
    },
    {
      id: FIELD_ID_NUMBER,
      name: 'revenue',
      type: 'NUMBER',
      options: null,
    },
  ],
} as unknown as EnrichedObjectMetadataItem;

const createFilter = (
  overrides: Partial<RecordFilter> & Pick<RecordFilter, 'fieldMetadataId'>,
): RecordFilter => ({
  id: 'filter-id',
  value: '',
  displayValue: '',
  type: 'TEXT',
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
          type: 'TEXT',
          operand: ViewFilterOperand.CONTAINS,
          value: 'Acme',
        }),
      ],
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result).toEqual({ companyName: 'Acme' });
  });

  it('should subtract one minute for DATE_TIME with IS_BEFORE operand', () => {
    const filterDate = new Date('2025-06-15T10:30:00.000Z');

    const result = buildRecordInputFromFilter({
      currentRecordFilters: [
        createFilter({
          fieldMetadataId: FIELD_ID_DATE_TIME,
          type: 'DATE_TIME',
          operand: ViewFilterOperand.IS_BEFORE,
          value: filterDate.toISOString(),
        }),
      ],
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result.createdAt).toEqual(new Date('2025-06-15T10:29:00.000Z'));
  });

  it('should not subtract a minute for DATE_TIME with IS operand', () => {
    const filterDate = new Date('2025-06-15T10:30:00.000Z');

    const result = buildRecordInputFromFilter({
      currentRecordFilters: [
        createFilter({
          fieldMetadataId: FIELD_ID_DATE_TIME,
          type: 'DATE_TIME',
          operand: ViewFilterOperand.IS,
          value: filterDate.toISOString(),
        }),
      ],
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result.createdAt).toEqual(filterDate);
  });

  it('should deep-merge a single composite address sub-field starting from empty object', () => {
    const result = buildRecordInputFromFilter({
      currentRecordFilters: [
        createFilter({
          fieldMetadataId: FIELD_ID_ADDRESS,
          type: 'ADDRESS',
          operand: ViewFilterOperand.CONTAINS,
          value: 'Paris',
          subFieldName: 'addressCity',
        }),
      ],
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result.address).toEqual({ addressCity: 'Paris' });
  });

  it('should merge composite address sub-fields into a single object', () => {
    const result = buildRecordInputFromFilter({
      currentRecordFilters: [
        createFilter({
          fieldMetadataId: FIELD_ID_ADDRESS,
          type: 'ADDRESS',
          operand: ViewFilterOperand.CONTAINS,
          value: 'Paris',
          subFieldName: 'addressCity',
        }),
        createFilter({
          id: 'filter-id-2',
          fieldMetadataId: FIELD_ID_ADDRESS,
          type: 'ADDRESS',
          operand: ViewFilterOperand.CONTAINS,
          value: 'France',
          subFieldName: 'addressCountry',
        }),
      ],
      objectMetadataItem: mockObjectMetadataItem,
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
          type: 'TEXT',
          operand: ViewFilterOperand.CONTAINS,
          value: 'something',
        }),
      ],
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result).toEqual({});
  });

  it('should skip filters where buildValueFromFilter returns undefined', () => {
    const result = buildRecordInputFromFilter({
      currentRecordFilters: [
        createFilter({
          fieldMetadataId: FIELD_ID_TEXT,
          type: 'TEXT',
          operand: ViewFilterOperand.IS_EMPTY,
          value: '',
        }),
      ],
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result).toEqual({});
  });

  it('should assign number value directly without merging', () => {
    const result = buildRecordInputFromFilter({
      currentRecordFilters: [
        createFilter({
          fieldMetadataId: FIELD_ID_NUMBER,
          type: 'NUMBER',
          operand: ViewFilterOperand.IS,
          value: '42',
        }),
      ],
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result).toEqual({ revenue: 42 });
  });
});
