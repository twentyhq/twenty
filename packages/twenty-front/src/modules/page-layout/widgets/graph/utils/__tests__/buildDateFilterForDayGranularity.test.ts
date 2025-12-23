import { ViewFilterOperand } from 'twenty-shared/types';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { buildDateFilterForDayGranularity } from '@/modules/page-layout/widgets/graph/utils/buildDateFilterForDayGranularity';

describe('buildDateFilterForDayGranularity', () => {
  describe('DATE field type', () => {
    it('should return single IS filter with plain date for DATE field', () => {
      const date = new Date('2024-03-15T10:00:00Z');
      const result = buildDateFilterForDayGranularity(
        date,
        FieldMetadataType.DATE,
        'createdAt',
      );

      expect(result).toHaveLength(1);
      expect(result[0].fieldName).toBe('createdAt');
      expect(result[0].operand).toBe(ViewFilterOperand.IS);
      expect(result[0].value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('DATE_TIME field type', () => {
    it('should return IS_AFTER and IS_BEFORE filters for DATE_TIME field', () => {
      const date = new Date('2024-03-15T10:00:00Z');
      const result = buildDateFilterForDayGranularity(
        date,
        FieldMetadataType.DATE_TIME,
        'createdAt',
      );

      expect(result).toHaveLength(2);
      expect(result[0].operand).toBe(ViewFilterOperand.IS_AFTER);
      expect(result[1].operand).toBe(ViewFilterOperand.IS_BEFORE);
      expect(result[0].value).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(result[1].value).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should apply timezone for DATE_TIME field when provided', () => {
      const date = new Date('2024-03-15T10:00:00Z');
      const timezone = 'America/New_York';

      const result = buildDateFilterForDayGranularity(
        date,
        FieldMetadataType.DATE_TIME,
        'createdAt',
        timezone,
      );

      expect(result).toHaveLength(2);
      expect(result[0].operand).toBe(ViewFilterOperand.IS_AFTER);
      expect(result[1].operand).toBe(ViewFilterOperand.IS_BEFORE);
    });
  });

  describe('unsupported field types', () => {
    it('should return empty array for non-date field types', () => {
      const date = new Date('2024-03-15T10:00:00Z');
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
      const date = new Date('2024-03-15');
      const result = buildDateFilterForDayGranularity(
        date,
        FieldMetadataType.DATE,
        'customFieldName',
      );

      expect(result[0].fieldName).toBe('customFieldName');
    });
  });
});
