import { Temporal } from 'temporal-polyfill';
import { ViewFilterOperand } from 'twenty-shared/types';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { buildDateFilterForDayGranularity } from '@/page-layout/widgets/graph/utils/buildDateFilterForDayGranularity';

describe('buildDateFilterForDayGranularity', () => {
  describe('DATE field type', () => {
    it('should return single IS filter with plain date for DATE field', () => {
      const date = Temporal.PlainDate.from('2024-03-15').toZonedDateTime({
        timeZone: 'Europe/Paris',
      });

      const result = buildDateFilterForDayGranularity(
        date,
        FieldMetadataType.DATE,
        'createdAt',
      );

      expect(result).toHaveLength(1);
      expect(result[0].fieldName).toBe('createdAt');
      expect(result[0].operand).toBe(ViewFilterOperand.IS);
      expect(result[0].value).toMatch('2024-03-15');
    });
  });

  describe('DATE_TIME field type', () => {
    it('should return IS_AFTER and IS_BEFORE filters for DATE_TIME field', () => {
      const date = Temporal.PlainDate.from('2024-03-15').toZonedDateTime({
        timeZone: 'Europe/Paris',
      });

      const result = buildDateFilterForDayGranularity(
        date,
        FieldMetadataType.DATE_TIME,
        'createdAt',
      );

      expect(result).toHaveLength(2);
      expect(result[0].operand).toBe(ViewFilterOperand.IS_AFTER);
      expect(result[1].operand).toBe(ViewFilterOperand.IS_BEFORE);
      expect(result[0].value).toMatch('2024-03-15T00:00:00+01:00');
      expect(result[1].value).toMatch('2024-03-16T00:00:00+01:00');
    });

    it('should handle extreme timezone for DATE_TIME - Auckland GMT+13', () => {
      const date = Temporal.PlainDate.from('2024-03-15').toZonedDateTime({
        timeZone: 'Pacific/Auckland',
      });

      const result = buildDateFilterForDayGranularity(
        date,
        FieldMetadataType.DATE_TIME,
        'createdAt',
      );

      expect(result).toHaveLength(2);
      expect(result[0].operand).toBe(ViewFilterOperand.IS_AFTER);
      expect(result[1].operand).toBe(ViewFilterOperand.IS_BEFORE);
      expect(result[0].value).toMatch('2024-03-15T00:00:00+13:00');
      expect(result[1].value).toMatch('2024-03-16T00:00:00+13:00');
    });

    it('should handle extreme timezone for DATE_TIME - Samoa GMT-11', () => {
      const date = Temporal.PlainDate.from('2024-03-15').toZonedDateTime({
        timeZone: 'Pacific/Samoa',
      });

      const result = buildDateFilterForDayGranularity(
        date,
        FieldMetadataType.DATE_TIME,
        'createdAt',
      );

      expect(result).toHaveLength(2);
      expect(result[0].operand).toBe(ViewFilterOperand.IS_AFTER);
      expect(result[1].operand).toBe(ViewFilterOperand.IS_BEFORE);
      expect(result[0].value).toMatch('2024-03-15T00:00:00-11:00');
      expect(result[1].value).toMatch('2024-03-16T00:00:00-11:00');
    });
  });

  describe('unsupported field types', () => {
    it('should return empty array for non-date field types', () => {
      const date = Temporal.Instant.from(
        '2024-03-15T10:00:00Z',
      ).toZonedDateTimeISO('Europe/Paris');

      const result = buildDateFilterForDayGranularity(
        date,
        FieldMetadataType.TEXT as FieldMetadataType.DATE,
        'name',
      );

      expect(result).toEqual([]);
    });
  });

  describe('field name handling', () => {
    it('should use provided fieldName in filters', () => {
      const date = Temporal.PlainDate.from('2024-03-15').toZonedDateTime({
        timeZone: 'Europe/Paris',
      });

      const result = buildDateFilterForDayGranularity(
        date,
        FieldMetadataType.DATE,
        'customFieldName',
      );

      expect(result[0].fieldName).toBe('customFieldName');
    });
  });
});
