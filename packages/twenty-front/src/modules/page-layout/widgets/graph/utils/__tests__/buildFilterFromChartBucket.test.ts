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

  const createField = (
    type: FieldMetadataType,
    name = 'testField',
  ): FieldMetadataItem =>
    ({
      id: 'field-1',
      name,
      type,
      label: 'Test Field',
    }) as FieldMetadataItem;

  describe('Empty values', () => {
    it.each([
      ['undefined', undefined],
      ['null', null],
      ['empty string', ''],
    ])('should return IS_EMPTY for %s', (_, value) => {
      const result = buildFilterFromChartBucket({
        fieldMetadataItem: createField(FieldMetadataType.TEXT),
        bucketRawValue: value,
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

  describe('Field types with IS operand and JSON array value', () => {
    it.each([
      [FieldMetadataType.SELECT, 'OPEN'],
      [FieldMetadataType.UUID, '123e4567-e89b-12d3-a456-426614174000'],
      [FieldMetadataType.RELATION, '123e4567-e89b-12d3-a456-426614174000'],
    ])('%s field type', (type, value) => {
      const result = buildFilterFromChartBucket({
        fieldMetadataItem: createField(type),
        bucketRawValue: value,
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.IS,
          value: `["${value}"]`,
        },
      ]);
    });

    it('should convert number to string for SELECT field', () => {
      const result = buildFilterFromChartBucket({
        fieldMetadataItem: createField(FieldMetadataType.SELECT),
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

  describe('Field types with IS operand and string value', () => {
    it.each([
      [FieldMetadataType.BOOLEAN, true, 'true'],
      [FieldMetadataType.BOOLEAN, false, 'false'],
      [FieldMetadataType.NUMBER, 1000, '1000'],
      [FieldMetadataType.NUMERIC, 42.5, '42.5'],
      [FieldMetadataType.RATING, 5, '5'],
    ])('%s field with value %s', (type, inputValue, expectedValue) => {
      const result = buildFilterFromChartBucket({
        fieldMetadataItem: createField(type),
        bucketRawValue: inputValue,
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.IS,
          value: expectedValue,
        },
      ]);
    });
  });

  describe('Field types with CONTAINS operand and string value', () => {
    it.each([
      [FieldMetadataType.TEXT, 'Acme Corp'],
      [FieldMetadataType.FULL_NAME, 'John Doe'],
      [FieldMetadataType.EMAILS, 'john@example.com'],
      [FieldMetadataType.PHONES, '+1234567890'],
      [FieldMetadataType.LINKS, 'https://example.com'],
      [FieldMetadataType.RAW_JSON, 'search-value'],
    ])('%s field type', (type, value) => {
      const result = buildFilterFromChartBucket({
        fieldMetadataItem: createField(type),
        bucketRawValue: value,
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.CONTAINS,
          value,
        },
      ]);
    });
  });

  describe('Field types with CONTAINS operand and JSON array value', () => {
    it.each([
      [FieldMetadataType.MULTI_SELECT, 'High'],
      [FieldMetadataType.ARRAY, 'value1'],
    ])('%s field type', (type, value) => {
      const result = buildFilterFromChartBucket({
        fieldMetadataItem: createField(type),
        bucketRawValue: value,
      });

      expect(result).toEqual([
        {
          fieldName: 'testField',
          operand: ViewFilterOperand.CONTAINS,
          value: `["${value}"]`,
        },
      ]);
    });
  });

  describe('Composite field types with subfields', () => {
    describe('CURRENCY', () => {
      it('should use IS operand for amountMicros (default)', () => {
        const result = buildFilterFromChartBucket({
          fieldMetadataItem: createField(FieldMetadataType.CURRENCY),
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

      it('should use IS with JSON array for currencyCode subfield', () => {
        const result = buildFilterFromChartBucket({
          fieldMetadataItem: createField(FieldMetadataType.CURRENCY),
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

    describe('ADDRESS', () => {
      it('should use CONTAINS for default subfields', () => {
        const result = buildFilterFromChartBucket({
          fieldMetadataItem: createField(FieldMetadataType.ADDRESS),
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

      it('should use IS with JSON array for addressCountry', () => {
        const result = buildFilterFromChartBucket({
          fieldMetadataItem: createField(FieldMetadataType.ADDRESS),
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

    describe('ACTOR', () => {
      it('should use CONTAINS for default subfields', () => {
        const result = buildFilterFromChartBucket({
          fieldMetadataItem: createField(FieldMetadataType.ACTOR),
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

      it('should use IS with JSON array for source subfield', () => {
        const result = buildFilterFromChartBucket({
          fieldMetadataItem: createField(FieldMetadataType.ACTOR),
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
  });

  describe('SubField name handling', () => {
    it('should include subField in fieldName when provided', () => {
      const result = buildFilterFromChartBucket({
        fieldMetadataItem: createField(FieldMetadataType.TEXT),
        bucketRawValue: 'test',
        subFieldName: 'subProperty',
      });

      expect(result[0].fieldName).toBe('testField.subProperty');
    });

    it.each([null, '', undefined])(
      'should use field name only when subFieldName is %s',
      (subFieldName) => {
        const result = buildFilterFromChartBucket({
          fieldMetadataItem: createField(FieldMetadataType.TEXT),
          bucketRawValue: 'test',
          subFieldName,
        });

        expect(result[0].fieldName).toBe('testField');
      },
    );
  });

  describe('Non-filterable field types', () => {
    it.each([
      FieldMetadataType.POSITION,
      FieldMetadataType.MORPH_RELATION,
      FieldMetadataType.TS_VECTOR,
      FieldMetadataType.RICH_TEXT,
      FieldMetadataType.RICH_TEXT_V2,
    ])('should return empty array for %s', (type) => {
      const result = buildFilterFromChartBucket({
        fieldMetadataItem: createField(type),
        bucketRawValue: 'some-value',
      });

      expect(result).toEqual([]);
    });
  });

  describe('DATE and DATE_TIME fields', () => {
    const mockDateFilters = [
      {
        fieldName: 'testField',
        operand: ViewFilterOperand.IS,
        value: '2024-01-15',
      },
    ];

    const mockRangeFilters = [
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
    ];

    beforeEach(() => {
      mockBuildDateFilterForDayGranularity.mockReturnValue(mockDateFilters);
      mockBuildDateRangeFiltersForGranularity.mockReturnValue(mockRangeFilters);
    });

    it('should return empty array for invalid date', () => {
      const result = buildFilterFromChartBucket({
        fieldMetadataItem: createField(FieldMetadataType.DATE),
        bucketRawValue: 'not-a-date',
      });

      expect(result).toEqual([]);
    });

    it.each([
      ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK,
      ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR,
      ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR,
    ])('should return empty array for unsupported granularity %s', (gran) => {
      const result = buildFilterFromChartBucket({
        fieldMetadataItem: createField(FieldMetadataType.DATE),
        bucketRawValue: '2024-01-15',
        dateGranularity: gran,
      });

      expect(result).toEqual([]);
    });

    it.each([
      ['no granularity', undefined],
      ['DAY granularity', ObjectRecordGroupByDateGranularity.DAY],
      ['NONE granularity', ObjectRecordGroupByDateGranularity.NONE],
    ])(
      'should call buildDateFilterForDayGranularity for %s',
      (_, granularity) => {
        const date = '2024-01-15';
        const timezone = 'America/New_York';

        buildFilterFromChartBucket({
          fieldMetadataItem: createField(FieldMetadataType.DATE_TIME),
          bucketRawValue: date,
          dateGranularity: granularity,
          timezone,
        });

        expect(mockBuildDateFilterForDayGranularity).toHaveBeenCalledWith(
          new Date(date),
          FieldMetadataType.DATE_TIME,
          'testField',
          timezone,
        );
      },
    );

    it.each([
      ObjectRecordGroupByDateGranularity.MONTH,
      ObjectRecordGroupByDateGranularity.QUARTER,
      ObjectRecordGroupByDateGranularity.YEAR,
    ])(
      'should call buildDateRangeFiltersForGranularity for %s',
      (granularity) => {
        const date = '2024-01-15';
        const timezone = 'Europe/London';

        const result = buildFilterFromChartBucket({
          fieldMetadataItem: createField(FieldMetadataType.DATE),
          bucketRawValue: date,
          dateGranularity: granularity,
          timezone,
        });

        expect(mockBuildDateRangeFiltersForGranularity).toHaveBeenCalledWith(
          new Date(date),
          granularity,
          FieldMetadataType.DATE,
          'testField',
          timezone,
        );
        expect(result).toEqual(mockRangeFilters);
      },
    );
  });
});
