import { FieldMetadataType } from 'twenty-shared/types';
import { getFieldIcon } from '../getFieldIcon';

describe('getFieldIcon', () => {
  describe('FieldMetadataType field types', () => {
    it('should return IconAbc for TEXT field type', () => {
      const result = getFieldIcon(FieldMetadataType.TEXT);
      expect(result).toBe('IconAbc');
    });

    it('should return IconText for NUMBER field type', () => {
      const result = getFieldIcon(FieldMetadataType.NUMBER);
      expect(result).toBe('IconText');
    });

    it('should return IconCheckbox for BOOLEAN field type', () => {
      const result = getFieldIcon(FieldMetadataType.BOOLEAN);
      expect(result).toBe('IconCheckbox');
    });

    it('should return IconCalendarEvent for DATE field type', () => {
      const result = getFieldIcon(FieldMetadataType.DATE);
      expect(result).toBe('IconCalendarEvent');
    });
  });

  describe('basic InputSchemaPropertyType field types', () => {
    it('should return IconQuestionMark for string type', () => {
      const result = getFieldIcon('string');
      expect(result).toBe('IconQuestionMark');
    });

    it('should return IconQuestionMark for number type', () => {
      const result = getFieldIcon('number');
      expect(result).toBe('IconQuestionMark');
    });

    it('should return IconQuestionMark for boolean type', () => {
      const result = getFieldIcon('boolean');
      expect(result).toBe('IconQuestionMark');
    });

    it('should return IconQuestionMark for object type', () => {
      const result = getFieldIcon('object');
      expect(result).toBe('IconQuestionMark');
    });

    it('should return IconQuestionMark for array type', () => {
      const result = getFieldIcon('array');
      expect(result).toBe('IconQuestionMark');
    });

    it('should return IconQuestionMark for unknown type', () => {
      const result = getFieldIcon('unknown');
      expect(result).toBe('IconQuestionMark');
    });
  });

  describe('other FieldMetadataType values', () => {
    it('should return IconQuestionMark for DATE_TIME field type', () => {
      const result = getFieldIcon(FieldMetadataType.DATE_TIME);
      expect(result).toBe('IconQuestionMark');
    });

    it('should return IconQuestionMark for EMAILS field type', () => {
      const result = getFieldIcon(FieldMetadataType.EMAILS);
      expect(result).toBe('IconQuestionMark');
    });

    it('should return IconQuestionMark for PHONES field type', () => {
      const result = getFieldIcon(FieldMetadataType.PHONES);
      expect(result).toBe('IconQuestionMark');
    });

    it('should return IconQuestionMark for LINKS field type', () => {
      const result = getFieldIcon(FieldMetadataType.LINKS);
      expect(result).toBe('IconQuestionMark');
    });

    it('should return IconQuestionMark for CURRENCY field type', () => {
      const result = getFieldIcon(FieldMetadataType.CURRENCY);
      expect(result).toBe('IconQuestionMark');
    });

    it('should return IconQuestionMark for SELECT field type', () => {
      const result = getFieldIcon(FieldMetadataType.SELECT);
      expect(result).toBe('IconQuestionMark');
    });

    it('should return IconQuestionMark for MULTI_SELECT field type', () => {
      const result = getFieldIcon(FieldMetadataType.MULTI_SELECT);
      expect(result).toBe('IconQuestionMark');
    });

    it('should return IconQuestionMark for RELATION field type', () => {
      const result = getFieldIcon(FieldMetadataType.RELATION);
      expect(result).toBe('IconQuestionMark');
    });

    it('should return IconQuestionMark for UUID field type', () => {
      const result = getFieldIcon(FieldMetadataType.UUID);
      expect(result).toBe('IconQuestionMark');
    });

    it('should return IconQuestionMark for RAW_JSON field type', () => {
      const result = getFieldIcon(FieldMetadataType.RAW_JSON);
      expect(result).toBe('IconQuestionMark');
    });

    it('should return IconQuestionMark for FULL_NAME field type', () => {
      const result = getFieldIcon(FieldMetadataType.FULL_NAME);
      expect(result).toBe('IconQuestionMark');
    });

    it('should return IconQuestionMark for ADDRESS field type', () => {
      const result = getFieldIcon(FieldMetadataType.ADDRESS);
      expect(result).toBe('IconQuestionMark');
    });

    it('should return IconQuestionMark for ARRAY field type', () => {
      const result = getFieldIcon(FieldMetadataType.ARRAY);
      expect(result).toBe('IconQuestionMark');
    });
  });

  describe('edge cases', () => {
    it('should return IconQuestionMark for undefined field type', () => {
      const result = getFieldIcon(undefined);
      expect(result).toBe('IconQuestionMark');
    });

    it('should return IconQuestionMark for null field type', () => {
      const result = getFieldIcon(null as any);
      expect(result).toBe('IconQuestionMark');
    });

    it('should return IconQuestionMark for empty string field type', () => {
      const result = getFieldIcon('' as any);
      expect(result).toBe('IconQuestionMark');
    });

    it('should return IconQuestionMark for invalid field type', () => {
      const result = getFieldIcon('INVALID_TYPE' as any);
      expect(result).toBe('IconQuestionMark');
    });
  });

  describe('icon mapping consistency', () => {
    it('should return consistent icons for the same field type', () => {
      const fieldType = FieldMetadataType.TEXT;
      const result1 = getFieldIcon(fieldType);
      const result2 = getFieldIcon(fieldType);

      expect(result1).toBe(result2);
      expect(result1).toBe('IconAbc');
    });

    it('should have unique icons for different supported field types', () => {
      const textIcon = getFieldIcon(FieldMetadataType.TEXT);
      const numberIcon = getFieldIcon(FieldMetadataType.NUMBER);
      const booleanIcon = getFieldIcon(FieldMetadataType.BOOLEAN);
      const dateIcon = getFieldIcon(FieldMetadataType.DATE);

      const icons = [textIcon, numberIcon, booleanIcon, dateIcon];
      const uniqueIcons = new Set(icons);

      expect(uniqueIcons.size).toBe(4);
      expect(icons).toEqual([
        'IconAbc',
        'IconText',
        'IconCheckbox',
        'IconCalendarEvent',
      ]);
    });

    it('should return IconQuestionMark for an unsupported field type', () => {
      const result = getFieldIcon('totally-unknown-type' as any);
      expect(result).toBe('IconQuestionMark');
    });
  });

  describe('function behavior', () => {
    it('should be a pure function with no side effects', () => {
      const fieldType = FieldMetadataType.TEXT;
      const result1 = getFieldIcon(fieldType);
      const result2 = getFieldIcon(fieldType);
      const result3 = getFieldIcon(fieldType);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      expect(result1).toBe('IconAbc');
    });
  });
});
