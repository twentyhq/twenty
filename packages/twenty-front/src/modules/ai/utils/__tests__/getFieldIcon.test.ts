import { FieldMetadataType } from 'twenty-shared/types';
import { getFieldIcon } from '../getFieldIcon';

describe('getFieldIcon', () => {
  describe('supported field types', () => {
    it('should return IconAbc for TEXT field type', () => {
      expect(getFieldIcon(FieldMetadataType.TEXT)).toBe('IconAbc');
    });
    it('should return IconText for NUMBER field type', () => {
      expect(getFieldIcon(FieldMetadataType.NUMBER)).toBe('IconText');
    });
    it('should return IconCheckbox for BOOLEAN field type', () => {
      expect(getFieldIcon(FieldMetadataType.BOOLEAN)).toBe('IconCheckbox');
    });
    it('should return IconCalendarEvent for DATE field type', () => {
      expect(getFieldIcon(FieldMetadataType.DATE)).toBe('IconCalendarEvent');
    });
  });

  describe('unsupported and edge cases', () => {
    it('should return IconQuestionMark for an unsupported field type', () => {
      expect(getFieldIcon('totally-unknown-type' as any)).toBe(
        'IconQuestionMark',
      );
    });
    it('should return IconQuestionMark for undefined', () => {
      expect(getFieldIcon(undefined)).toBe('IconQuestionMark');
    });
    it('should return IconQuestionMark for null', () => {
      expect(getFieldIcon(null as any)).toBe('IconQuestionMark');
    });
    it('should return IconQuestionMark for empty string', () => {
      expect(getFieldIcon('' as any)).toBe('IconQuestionMark');
    });
  });

  describe('consistency', () => {
    it('should return the same icon for the same field type', () => {
      const result1 = getFieldIcon(FieldMetadataType.TEXT);
      const result2 = getFieldIcon(FieldMetadataType.TEXT);
      expect(result1).toBe(result2);
    });
  });
});
