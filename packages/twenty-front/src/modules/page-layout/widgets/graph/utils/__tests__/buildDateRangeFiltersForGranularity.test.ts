import { Temporal } from 'temporal-polyfill';
import {
  ObjectRecordGroupByDateGranularity,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { buildDateRangeFiltersForGranularity } from '@/page-layout/widgets/graph/utils/buildDateRangeFiltersForGranularity';

const testDate = Temporal.PlainDate.from('2024-03-15').toZonedDateTime({
  timeZone: 'Europe/Paris',
});

describe('buildDateRangeFiltersForGranularity', () => {
  describe('WEEK granularity', () => {
    it('should return IS_AFTER and IS_BEFORE filters for DATE field', () => {
      const result = buildDateRangeFiltersForGranularity(
        testDate,
        ObjectRecordGroupByDateGranularity.WEEK,
        FieldMetadataType.DATE,
        'createdAt',
      );

      expect(result).toHaveLength(2);
      expect(result[0].operand).toBe(ViewFilterOperand.IS_AFTER);
      expect(result[1].operand).toBe(ViewFilterOperand.IS_BEFORE);
    });

    it('should return ISO strings for DATE_TIME field', () => {
      const result = buildDateRangeFiltersForGranularity(
        testDate,
        ObjectRecordGroupByDateGranularity.WEEK,
        FieldMetadataType.DATE_TIME,
        'createdAt',
      );

      expect(result).toHaveLength(2);
      expect(result[0].value).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(result[1].value).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('MONTH granularity', () => {
    it('should return IS_AFTER and IS_BEFORE filters for DATE field', () => {
      const result = buildDateRangeFiltersForGranularity(
        testDate,
        ObjectRecordGroupByDateGranularity.MONTH,
        FieldMetadataType.DATE,
        'createdAt',
      );

      expect(result).toHaveLength(2);
      expect(result[0].operand).toBe(ViewFilterOperand.IS_AFTER);
      expect(result[1].operand).toBe(ViewFilterOperand.IS_BEFORE);
    });

    it('should return ISO strings for DATE_TIME field without timezone', () => {
      const result = buildDateRangeFiltersForGranularity(
        testDate,
        ObjectRecordGroupByDateGranularity.MONTH,
        FieldMetadataType.DATE_TIME,
        'createdAt',
      );

      expect(result).toHaveLength(2);
      expect(result[0].operand).toBe(ViewFilterOperand.IS_AFTER);
      expect(result[1].operand).toBe(ViewFilterOperand.IS_BEFORE);
      expect(result[0].value).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(result[1].value).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('QUARTER granularity', () => {
    it('should return filters for Q1 date', () => {
      const firstQuarterDateTime = Temporal.PlainDate.from(
        '2024-02-15',
      ).toZonedDateTime({
        timeZone: 'Europe/Paris',
      });

      const result = buildDateRangeFiltersForGranularity(
        firstQuarterDateTime,
        ObjectRecordGroupByDateGranularity.QUARTER,
        FieldMetadataType.DATE,
        'createdAt',
      );

      expect(result).toHaveLength(2);
      expect(result[0].operand).toBe(ViewFilterOperand.IS_AFTER);
      expect(result[1].operand).toBe(ViewFilterOperand.IS_BEFORE);
    });

    it('should return ISO strings for DATE_TIME field', () => {
      const result = buildDateRangeFiltersForGranularity(
        testDate,
        ObjectRecordGroupByDateGranularity.QUARTER,
        FieldMetadataType.DATE_TIME,
        'createdAt',
      );

      expect(result).toHaveLength(2);
      expect(result[0].operand).toBe(ViewFilterOperand.IS_AFTER);
      expect(result[1].operand).toBe(ViewFilterOperand.IS_BEFORE);
      expect(result[0].value).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(result[1].value).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('YEAR granularity', () => {
    it('should return start and end of year for DATE field', () => {
      const midYearDateTime = Temporal.PlainDate.from(
        '2024-06-15',
      ).toZonedDateTime({
        timeZone: 'Europe/Paris',
      });

      const result = buildDateRangeFiltersForGranularity(
        midYearDateTime,
        ObjectRecordGroupByDateGranularity.YEAR,
        FieldMetadataType.DATE,
        'createdAt',
      );

      expect(result).toHaveLength(2);
      expect(result[0].operand).toBe(ViewFilterOperand.IS_AFTER);
      expect(result[1].operand).toBe(ViewFilterOperand.IS_BEFORE);
    });

    it('should return ISO strings for DATE_TIME field', () => {
      const midYearDateTime = Temporal.PlainDate.from(
        '2024-06-15',
      ).toZonedDateTime({
        timeZone: 'Europe/Paris',
      });

      const result = buildDateRangeFiltersForGranularity(
        midYearDateTime,
        ObjectRecordGroupByDateGranularity.YEAR,
        FieldMetadataType.DATE_TIME,
        'createdAt',
      );

      expect(result).toHaveLength(2);
      expect(result[0].value).toMatch(/^2024-01-01T/);
      expect(result[1].value).toMatch(/^2025-01-01T/);
    });
  });

  describe('Field name handling', () => {
    it('should use provided fieldName in filters', () => {
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
