import { buildDateRangeFiltersForGranularity } from '@/page-layout/widgets/graph/utils/buildDateRangeFiltersForGranularity';
import { calculateQuarterDateRange } from '@/page-layout/widgets/graph/utils/calculateQuarterDateRange';
import {
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  getEndUnitOfDateTime,
  getPlainDateFromDate,
  getStartUnitOfDateTime,
} from 'twenty-shared/utils';

jest.mock('@/page-layout/widgets/graph/utils/calculateQuarterDateRange');

const mockCalculateQuarterDateRange =
  calculateQuarterDateRange as jest.MockedFunction<
    typeof calculateQuarterDateRange
  >;

describe('buildDateRangeFiltersForGranularity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('MONTH granularity', () => {
    it('should return IS_AFTER and IS_BEFORE filters for DATE field', () => {
      const testDate = new Date('2024-03-15');
      const result = buildDateRangeFiltersForGranularity(
        testDate,
        ObjectRecordGroupByDateGranularity.MONTH,
        FieldMetadataType.DATE,
        'createdAt',
      );

      const startOfMonth = getStartUnitOfDateTime(testDate, 'MONTH');
      const endOfMonth = getEndUnitOfDateTime(testDate, 'MONTH');

      expect(result).toEqual([
        {
          fieldName: 'createdAt',
          operand: ViewFilterOperand.IS_AFTER,
          value: getPlainDateFromDate(startOfMonth),
        },
        {
          fieldName: 'createdAt',
          operand: ViewFilterOperand.IS_BEFORE,
          value: getPlainDateFromDate(endOfMonth),
        },
      ]);
    });

    it('should return ISO strings for DATE_TIME field without timezone', () => {
      const testDate = new Date('2024-03-15T10:00:00Z');
      const result = buildDateRangeFiltersForGranularity(
        testDate,
        ObjectRecordGroupByDateGranularity.MONTH,
        FieldMetadataType.DATE_TIME,
        'createdAt',
      );

      expect(result).toHaveLength(2);
      expect(result[0].operand).toBe(ViewFilterOperand.IS_AFTER);
      expect(result[1].operand).toBe(ViewFilterOperand.IS_BEFORE);
      // Values should be ISO strings
      expect(result[0].value).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(result[1].value).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should apply timezone for DATE_TIME field when provided', () => {
      const testDate = new Date('2024-03-15T10:00:00Z');
      const timezone = 'America/New_York';

      const result = buildDateRangeFiltersForGranularity(
        testDate,
        ObjectRecordGroupByDateGranularity.MONTH,
        FieldMetadataType.DATE_TIME,
        'createdAt',
        timezone,
      );

      expect(result).toHaveLength(2);
      expect(result[0].operand).toBe(ViewFilterOperand.IS_AFTER);
      expect(result[1].operand).toBe(ViewFilterOperand.IS_BEFORE);
    });
  });

  describe('QUARTER granularity', () => {
    beforeEach(() => {
      mockCalculateQuarterDateRange.mockReturnValue({
        rangeStartDate: new Date('2024-01-01'),
        rangeEndDate: new Date('2024-03-31T23:59:59.999Z'),
      });
    });

    it('should call calculateQuarterDateRange and use its result for DATE field', () => {
      const testDate = new Date('2024-02-15');

      const result = buildDateRangeFiltersForGranularity(
        testDate,
        ObjectRecordGroupByDateGranularity.QUARTER,
        FieldMetadataType.DATE,
        'createdAt',
      );

      expect(mockCalculateQuarterDateRange).toHaveBeenCalledWith(
        testDate,
        undefined,
      );

      expect(result).toEqual([
        {
          fieldName: 'createdAt',
          operand: ViewFilterOperand.IS_AFTER,
          value: getPlainDateFromDate(new Date('2024-01-01')),
        },
        {
          fieldName: 'createdAt',
          operand: ViewFilterOperand.IS_BEFORE,
          value: getPlainDateFromDate(new Date('2024-03-31T23:59:59.999Z')),
        },
      ]);
    });

    it('should pass timezone to calculateQuarterDateRange for DATE_TIME field', () => {
      const testDate = new Date('2024-02-15');
      const timezone = 'Europe/London';

      buildDateRangeFiltersForGranularity(
        testDate,
        ObjectRecordGroupByDateGranularity.QUARTER,
        FieldMetadataType.DATE_TIME,
        'createdAt',
        timezone,
      );

      expect(mockCalculateQuarterDateRange).toHaveBeenCalledWith(
        expect.any(Date),
        timezone,
      );
    });

    it('should return ISO strings for DATE_TIME field', () => {
      const testDate = new Date('2024-02-15');

      const result = buildDateRangeFiltersForGranularity(
        testDate,
        ObjectRecordGroupByDateGranularity.QUARTER,
        FieldMetadataType.DATE_TIME,
        'createdAt',
      );

      expect(result[0].value).toBe(new Date('2024-01-01').toISOString());
      expect(result[1].value).toBe(
        new Date('2024-03-31T23:59:59.999Z').toISOString(),
      );
    });
  });

  describe('YEAR granularity', () => {
    it('should return start and end of year for DATE field', () => {
      const testDate = new Date('2024-06-15');

      const result = buildDateRangeFiltersForGranularity(
        testDate,
        ObjectRecordGroupByDateGranularity.YEAR,
        FieldMetadataType.DATE,
        'createdAt',
      );

      const startOfYear = getStartUnitOfDateTime(testDate, 'YEAR');
      const endOfYear = getEndUnitOfDateTime(testDate, 'YEAR');

      expect(result).toEqual([
        {
          fieldName: 'createdAt',
          operand: ViewFilterOperand.IS_AFTER,
          value: getPlainDateFromDate(startOfYear),
        },
        {
          fieldName: 'createdAt',
          operand: ViewFilterOperand.IS_BEFORE,
          value: getPlainDateFromDate(endOfYear),
        },
      ]);
    });

    it('should return ISO strings for DATE_TIME field', () => {
      const testDate = new Date('2024-06-15T10:00:00Z');

      const result = buildDateRangeFiltersForGranularity(
        testDate,
        ObjectRecordGroupByDateGranularity.YEAR,
        FieldMetadataType.DATE_TIME,
        'createdAt',
      );

      expect(result).toHaveLength(2);
      expect(result[0].value).toMatch(/^2024-01-01T/);
      expect(result[1].value).toMatch(/^2024-12-31T/);
    });

    it('should apply timezone for DATE_TIME field', () => {
      const testDate = new Date('2024-06-15T10:00:00Z');
      const timezone = 'Asia/Tokyo';

      const result = buildDateRangeFiltersForGranularity(
        testDate,
        ObjectRecordGroupByDateGranularity.YEAR,
        FieldMetadataType.DATE_TIME,
        'createdAt',
        timezone,
      );

      expect(result).toHaveLength(2);
      expect(result[0].operand).toBe(ViewFilterOperand.IS_AFTER);
      expect(result[1].operand).toBe(ViewFilterOperand.IS_BEFORE);
    });
  });

  describe('Field name handling', () => {
    it('should use provided fieldName in filters', () => {
      const testDate = new Date('2024-03-15');

      const result = buildDateRangeFiltersForGranularity(
        testDate,
        ObjectRecordGroupByDateGranularity.MONTH,
        FieldMetadataType.DATE,
        'customFieldName',
      );

      expect(result[0].fieldName).toBe('customFieldName');
      expect(result[1].fieldName).toBe('customFieldName');
    });

    it('should handle subField-style fieldName', () => {
      const testDate = new Date('2024-03-15');

      const result = buildDateRangeFiltersForGranularity(
        testDate,
        ObjectRecordGroupByDateGranularity.MONTH,
        FieldMetadataType.DATE,
        'parent.subField',
      );

      expect(result[0].fieldName).toBe('parent.subField');
      expect(result[1].fieldName).toBe('parent.subField');
    });
  });
});
