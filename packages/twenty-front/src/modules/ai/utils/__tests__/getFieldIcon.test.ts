import { getFieldIcon } from '@/ai/utils/getFieldIcon';

describe('getFieldIcon', () => {
  describe('supported field types', () => {
    it('should return IconAbc for string field type', () => {
      expect(getFieldIcon('string')).toBe('IconAbc');
    });
    it('should return IconText for number field type', () => {
      expect(getFieldIcon('number')).toBe('IconText');
    });
    it('should return IconCheckbox for boolean field type', () => {
      expect(getFieldIcon('boolean')).toBe('IconCheckbox');
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
      const result1 = getFieldIcon('string');
      const result2 = getFieldIcon('string');
      expect(result1).toBe(result2);
    });
  });
});
