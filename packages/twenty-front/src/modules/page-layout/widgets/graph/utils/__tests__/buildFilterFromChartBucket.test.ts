import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { buildDateFilterForDayGranularity } from '@/page-layout/widgets/graph/utils/buildDateFilterForDayGranularity';
import { buildDateRangeFiltersForGranularity } from '@/page-layout/widgets/graph/utils/buildDateRangeFiltersForGranularity';
import { buildFilterFromChartBucket } from '@/page-layout/widgets/graph/utils/buildFilterFromChartBucket';
import {
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
  ViewFilterOperand,
} from 'twenty-shared/types';

jest.mock('@/page-layout/widgets/graph/utils/buildDateFilterForDayGranularity');
jest.mock(
  '@/page-layout/widgets/graph/utils/buildDateRangeFiltersForGranularity',
);

const mockBuildDateFilterForDayGranularity =
  buildDateFilterForDayGranularity as jest.MockedFunction<
    typeof buildDateFilterForDayGranularity
  >;
const mockBuildDateRangeFiltersForGranularity =
  buildDateRangeFiltersForGranularity as jest.MockedFunction<
    typeof buildDateRangeFiltersForGranularity
  >;

describe('buildFilterFromChartBucket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createFieldMetadataItem = (
    type: FieldMetadataType,
    name = 'testField',
  ): FieldMetadataItem =>
    ({
      id: 'field-1',
      name,
      type,
      label: 'Test Field',
    }) as FieldMetadataItem;

  describe('Empty and null bucket values', () => {
    it('should return IS_EMPTY filter when bucketRawValue is undefined', () => {
      const fieldMetadataItem = createFieldMetadataItem(FieldMetadataType.TEXT);

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: undefined,
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.IS_EMPTY,
          value: '',
        },
      ]);
    });

    it('should return IS_EMPTY filter when bucketRawValue is null', () => {
      const fieldMetadataItem = createFieldMetadataItem(FieldMetadataType.TEXT);

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: null,
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.IS_EMPTY,
          value: '',
        },
      ]);
    });

    it('should return IS_EMPTY filter when bucketRawValue is empty string', () => {
      const fieldMetadataItem = createFieldMetadataItem(FieldMetadataType.TEXT);

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: '',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.IS_EMPTY,
          value: '',
        },
      ]);
    });
  });

  describe('SELECT field type', () => {
    it('should return IS filter with JSON array value', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.SELECT,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'OPEN',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.IS,
          value: '["OPEN"]',
        },
      ]);
    });

    it('should convert number to string in JSON array for SELECT field', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.SELECT,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 123,
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.IS,
          value: '["123"]',
        },
      ]);
    });
  });

  describe('MULTI_SELECT field type', () => {
    it('should return CONTAINS filter with JSON array value', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.MULTI_SELECT,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'High',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.CONTAINS,
          value: '["High"]',
        },
      ]);
    });

    it('should build filter for MULTI_SELECT fields with empty value', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.MULTI_SELECT,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: '',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.IS_EMPTY,
          value: '',
        },
      ]);
    });
  });

  describe('TEXT field type', () => {
    it('should return CONTAINS filter with string value', () => {
      const fieldMetadataItem = createFieldMetadataItem(FieldMetadataType.TEXT);

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'Acme Corp',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.CONTAINS,
          value: 'Acme Corp',
        },
      ]);
    });
  });

  describe('BOOLEAN field type', () => {
    it('should return IS filter for BOOLEAN field with true value', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.BOOLEAN,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: true,
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.IS,
          value: 'true',
        },
      ]);
    });

    it('should return IS filter for BOOLEAN field with false value', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.BOOLEAN,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: false,
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.IS,
          value: 'false',
        },
      ]);
    });
  });

  describe('NUMBER and NUMERIC field types', () => {
    it('should return IS filter for NUMBER field', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.NUMBER,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 1000,
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.IS,
          value: '1000',
        },
      ]);
    });

    it('should return IS filter for NUMERIC field', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.NUMERIC,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 42.5,
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.IS,
          value: '42.5',
        },
      ]);
    });
  });

  describe('RATING field type', () => {
    it('should return IS filter for RATING field', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.RATING,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 5,
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.IS,
          value: '5',
        },
      ]);
    });
  });

  describe('UUID field type', () => {
    it('should return IS filter with JSON array for UUID field', () => {
      const fieldMetadataItem = createFieldMetadataItem(FieldMetadataType.UUID);
      const uuid = '123e4567-e89b-12d3-a456-426614174000';

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: uuid,
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.IS,
          value: `["${uuid}"]`,
        },
      ]);
    });
  });

  describe('CURRENCY field type', () => {
    it('should return IS filter for amountMicros (no subfield)', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.CURRENCY,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 1000,
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.IS,
          value: '1000',
        },
      ]);
    });

    it('should return IS filter for amountMicros subfield', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.CURRENCY,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 1000,
        subFieldName: 'amountMicros',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField.amountMicros',
          operand: ViewFilterOperand.IS,
          value: '1000',
        },
      ]);
    });

    it('should return IS filter with JSON array for currencyCode subfield', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.CURRENCY,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'USD',
        subFieldName: 'currencyCode',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField.currencyCode',
          operand: ViewFilterOperand.IS,
          value: '["USD"]',
        },
      ]);
    });
  });

  describe('FULL_NAME field type', () => {
    it('should return CONTAINS filter without subfield', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.FULL_NAME,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'John Doe',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.CONTAINS,
          value: 'John Doe',
        },
      ]);
    });

    it('should return CONTAINS filter with firstName subfield', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.FULL_NAME,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'John',
        subFieldName: 'firstName',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField.firstName',
          operand: ViewFilterOperand.CONTAINS,
          value: 'John',
        },
      ]);
    });
  });

  describe('EMAILS field type', () => {
    it('should return CONTAINS filter for EMAILS field', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.EMAILS,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'john@example.com',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.CONTAINS,
          value: 'john@example.com',
        },
      ]);
    });

    it('should return CONTAINS filter with primaryEmail subfield', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.EMAILS,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'john@example.com',
        subFieldName: 'primaryEmail',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField.primaryEmail',
          operand: ViewFilterOperand.CONTAINS,
          value: 'john@example.com',
        },
      ]);
    });
  });

  describe('PHONES field type', () => {
    it('should return CONTAINS filter for PHONES field', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.PHONES,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: '+1234567890',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.CONTAINS,
          value: '+1234567890',
        },
      ]);
    });

    it('should return CONTAINS filter with primaryPhoneNumber subfield', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.PHONES,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: '1234567890',
        subFieldName: 'primaryPhoneNumber',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField.primaryPhoneNumber',
          operand: ViewFilterOperand.CONTAINS,
          value: '1234567890',
        },
      ]);
    });
  });

  describe('LINKS field type', () => {
    it('should return CONTAINS filter for LINKS field', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.LINKS,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'https://example.com',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.CONTAINS,
          value: 'https://example.com',
        },
      ]);
    });

    it('should return CONTAINS filter with primaryLinkUrl subfield', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.LINKS,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'https://example.com',
        subFieldName: 'primaryLinkUrl',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField.primaryLinkUrl',
          operand: ViewFilterOperand.CONTAINS,
          value: 'https://example.com',
        },
      ]);
    });
  });

  describe('ADDRESS field type', () => {
    it('should return CONTAINS filter without subfield', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.ADDRESS,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'New York',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.CONTAINS,
          value: 'New York',
        },
      ]);
    });

    it('should return CONTAINS filter with addressCity subfield', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.ADDRESS,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'New York',
        subFieldName: 'addressCity',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField.addressCity',
          operand: ViewFilterOperand.CONTAINS,
          value: 'New York',
        },
      ]);
    });

    it('should return IS filter with JSON array for addressCountry subfield', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.ADDRESS,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'US',
        subFieldName: 'addressCountry',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField.addressCountry',
          operand: ViewFilterOperand.IS,
          value: '["US"]',
        },
      ]);
    });
  });

  describe('ACTOR field type', () => {
    it('should return CONTAINS filter without subfield', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.ACTOR,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'John Doe',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.CONTAINS,
          value: 'John Doe',
        },
      ]);
    });

    it('should return CONTAINS filter with name subfield', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.ACTOR,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'John Doe',
        subFieldName: 'name',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField.name',
          operand: ViewFilterOperand.CONTAINS,
          value: 'John Doe',
        },
      ]);
    });

    it('should return IS filter with JSON array for source subfield', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.ACTOR,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'EMAIL',
        subFieldName: 'source',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField.source',
          operand: ViewFilterOperand.IS,
          value: '["EMAIL"]',
        },
      ]);
    });
  });

  describe('ARRAY field type', () => {
    it('should return CONTAINS filter with JSON array for ARRAY field', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.ARRAY,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'value1',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.CONTAINS,
          value: '["value1"]',
        },
      ]);
    });
  });

  describe('RAW_JSON field type', () => {
    it('should return CONTAINS filter for RAW_JSON field', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.RAW_JSON,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'search-value',
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.CONTAINS,
          value: 'search-value',
        },
      ]);
    });
  });

  describe('RELATION field type', () => {
    it('should return IS filter with JSON array for RELATION field', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.RELATION,
      );
      const uuid = '123e4567-e89b-12d3-a456-426614174000';

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: uuid,
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.IS,
          value: `["${uuid}"]`,
        },
      ]);
    });
  });

  describe('Non-filterable field types', () => {
    it('should return empty array for POSITION field', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.POSITION,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'some-value',
      });

      expect(result).toEqual([]);
    });

    it('should return empty array for MORPH_RELATION field', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.MORPH_RELATION,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'some-value',
      });

      expect(result).toEqual([]);
    });

    it('should return empty array for TS_VECTOR field', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.TS_VECTOR,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'some-value',
      });

      expect(result).toEqual([]);
    });

    it('should return empty array for RICH_TEXT field', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.RICH_TEXT,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'some-value',
      });

      expect(result).toEqual([]);
    });

    it('should return empty array for RICH_TEXT_V2 field', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.RICH_TEXT_V2,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'some-value',
      });

      expect(result).toEqual([]);
    });
  });

  describe('SubField handling', () => {
    it('should include subField in fieldName when provided', () => {
      const fieldMetadataItem = createFieldMetadataItem(FieldMetadataType.TEXT);

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'test',
        subFieldName: 'subProperty',
      });

      expect(result[0].fieldName).toBe('testField.subProperty');
    });

    it('should use field name only when subFieldName is null', () => {
      const fieldMetadataItem = createFieldMetadataItem(FieldMetadataType.TEXT);

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'test',
        subFieldName: null,
      });

      expect(result[0].fieldName).toBe('testField');
    });

    it('should use field name only when subFieldName is empty string', () => {
      const fieldMetadataItem = createFieldMetadataItem(FieldMetadataType.TEXT);

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'test',
        subFieldName: '',
      });

      expect(result[0].fieldName).toBe('testField');
    });
  });

  describe('DATE/DATE_TIME fields - Invalid dates', () => {
    it('should return empty array for invalid date string', () => {
      const fieldMetadataItem = createFieldMetadataItem(FieldMetadataType.DATE);

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'not-a-date',
      });

      expect(result).toEqual([]);
    });

    it('should return empty array for invalid DATE_TIME string', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.DATE_TIME,
      );

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: 'invalid-date-time',
      });

      expect(result).toEqual([]);
    });
  });

  describe('DATE/DATE_TIME fields - Unsupported granularities', () => {
    it('should return empty array for DAY_OF_THE_WEEK granularity', () => {
      const fieldMetadataItem = createFieldMetadataItem(FieldMetadataType.DATE);

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: '2024-01-15',
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK,
      });

      expect(result).toEqual([]);
    });

    it('should return empty array for MONTH_OF_THE_YEAR granularity', () => {
      const fieldMetadataItem = createFieldMetadataItem(FieldMetadataType.DATE);

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: '2024-01-15',
        dateGranularity: ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR,
      });

      expect(result).toEqual([]);
    });

    it('should return empty array for QUARTER_OF_THE_YEAR granularity', () => {
      const fieldMetadataItem = createFieldMetadataItem(FieldMetadataType.DATE);

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: '2024-01-15',
        dateGranularity: ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR,
      });

      expect(result).toEqual([]);
    });
  });

  describe('DATE/DATE_TIME fields - DAY granularity', () => {
    beforeEach(() => {
      mockBuildDateFilterForDayGranularity.mockReturnValue([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.IS,
          value: '2024-01-15',
        },
      ]);
    });

    it('should call buildDateFilterForDayGranularity for DAY granularity', () => {
      const fieldMetadataItem = createFieldMetadataItem(FieldMetadataType.DATE);
      const date = '2024-01-15';

      buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: date,
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
      });

      expect(mockBuildDateFilterForDayGranularity).toHaveBeenCalledWith(
        new Date(date),
        FieldMetadataType.DATE,
        'testField',
        undefined,
      );
    });

    it('should call buildDateFilterForDayGranularity for NONE granularity', () => {
      const fieldMetadataItem = createFieldMetadataItem(FieldMetadataType.DATE);
      const date = '2024-01-15';

      buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: date,
        dateGranularity: ObjectRecordGroupByDateGranularity.NONE,
      });

      expect(mockBuildDateFilterForDayGranularity).toHaveBeenCalledWith(
        new Date(date),
        FieldMetadataType.DATE,
        'testField',
        undefined,
      );
    });

    it('should call buildDateFilterForDayGranularity when no granularity is provided', () => {
      const fieldMetadataItem = createFieldMetadataItem(FieldMetadataType.DATE);
      const date = '2024-01-15';

      buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: date,
      });

      expect(mockBuildDateFilterForDayGranularity).toHaveBeenCalledWith(
        new Date(date),
        FieldMetadataType.DATE,
        'testField',
        undefined,
      );
    });

    it('should pass timezone to buildDateFilterForDayGranularity', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.DATE_TIME,
      );
      const date = '2024-01-15';
      const timezone = 'America/New_York';

      buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: date,
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        timezone,
      });

      expect(mockBuildDateFilterForDayGranularity).toHaveBeenCalledWith(
        new Date(date),
        FieldMetadataType.DATE_TIME,
        'testField',
        timezone,
      );
    });
  });

  describe('DATE/DATE_TIME fields - Range granularities (MONTH, QUARTER, YEAR)', () => {
    beforeEach(() => {
      mockBuildDateRangeFiltersForGranularity.mockReturnValue([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.IS_AFTER,
          value: '2024-01-01',
        },
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.IS_BEFORE,
          value: '2024-01-31',
        },
      ]);
    });

    it('should call buildDateRangeFiltersForGranularity for MONTH granularity', () => {
      const fieldMetadataItem = createFieldMetadataItem(FieldMetadataType.DATE);
      const date = '2024-01-15';

      buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: date,
        dateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
      });

      expect(mockBuildDateRangeFiltersForGranularity).toHaveBeenCalledWith(
        new Date(date),
        ObjectRecordGroupByDateGranularity.MONTH,
        FieldMetadataType.DATE,
        'testField',
        undefined,
      );
    });

    it('should call buildDateRangeFiltersForGranularity for QUARTER granularity', () => {
      const fieldMetadataItem = createFieldMetadataItem(FieldMetadataType.DATE);
      const date = '2024-01-15';

      buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: date,
        dateGranularity: ObjectRecordGroupByDateGranularity.QUARTER,
      });

      expect(mockBuildDateRangeFiltersForGranularity).toHaveBeenCalledWith(
        new Date(date),
        ObjectRecordGroupByDateGranularity.QUARTER,
        FieldMetadataType.DATE,
        'testField',
        undefined,
      );
    });

    it('should call buildDateRangeFiltersForGranularity for YEAR granularity', () => {
      const fieldMetadataItem = createFieldMetadataItem(FieldMetadataType.DATE);
      const date = '2024-01-15';

      buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: date,
        dateGranularity: ObjectRecordGroupByDateGranularity.YEAR,
      });

      expect(mockBuildDateRangeFiltersForGranularity).toHaveBeenCalledWith(
        new Date(date),
        ObjectRecordGroupByDateGranularity.YEAR,
        FieldMetadataType.DATE,
        'testField',
        undefined,
      );
    });

    it('should pass timezone to buildDateRangeFiltersForGranularity', () => {
      const fieldMetadataItem = createFieldMetadataItem(
        FieldMetadataType.DATE_TIME,
      );
      const date = '2024-01-15';
      const timezone = 'Europe/London';

      buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: date,
        dateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
        timezone,
      });

      expect(mockBuildDateRangeFiltersForGranularity).toHaveBeenCalledWith(
        new Date(date),
        ObjectRecordGroupByDateGranularity.MONTH,
        FieldMetadataType.DATE_TIME,
        'testField',
        timezone,
      );
    });

    it('should return filters from buildDateRangeFiltersForGranularity', () => {
      const fieldMetadataItem = createFieldMetadataItem(FieldMetadataType.DATE);

      const result = buildFilterFromChartBucket({
        fieldMetadataItem,
        bucketRawValue: '2024-01-15',
        dateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.IS_AFTER,
          value: '2024-01-01',
        },
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.IS_BEFORE,
          value: '2024-01-31',
        },
      ]);
    });
  });
});
