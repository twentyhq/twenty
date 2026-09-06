import { getNumberValueToPersist } from '@/object-record/record-field/ui/meta-types/input/utils/getNumberValueToPersist';

describe('getNumberValueToPersist', () => {
  describe('standard number', () => {
    it('should persist a valid integer string', () => {
      const result = getNumberValueToPersist({
        newValue: '42',
      });

      expect(result).toEqual({ success: true, value: 42 });
    });

    it('should persist a valid float string', () => {
      const result = getNumberValueToPersist({
        newValue: '42.5',
      });

      expect(result).toEqual({ success: true, value: 42.5 });
    });

    it('should return null when empty string', () => {
      const result = getNumberValueToPersist({
        newValue: '',
      });

      expect(result).toEqual({ success: true, value: null });
    });

    it('should return success false when non-numeric string', () => {
      const result = getNumberValueToPersist({
        newValue: 'abc',
      });

      expect(result).toEqual({ success: false });
    });
  });

  describe('percentage', () => {
    it('should persist a percentage string with a % symbol without throwing', () => {
      const result = getNumberValueToPersist({
        newValue: '50%',
        numberType: 'percentage',
      });

      expect(result).toEqual({ success: true, value: 0.5 });
    });

    it('should persist a decimal percentage string with a % symbol', () => {
      const result = getNumberValueToPersist({
        newValue: '12.5%',
        numberType: 'percentage',
      });

      expect(result).toEqual({ success: true, value: 0.125 });
    });

    it('should persist a percentage string without a % symbol', () => {
      const result = getNumberValueToPersist({
        newValue: '25',
        numberType: 'percentage',
      });

      expect(result).toEqual({ success: true, value: 0.25 });
    });

    it('should return null for empty percentage input', () => {
      const result = getNumberValueToPersist({
        newValue: '',
        numberType: 'percentage',
      });

      expect(result).toEqual({ success: true, value: null });
    });

    it('should return success false for invalid percentage input', () => {
      const result = getNumberValueToPersist({
        newValue: 'foo%',
        numberType: 'percentage',
      });

      expect(result).toEqual({ success: false });
    });

    it('should return success false when input is only a % symbol', () => {
      const result = getNumberValueToPersist({
        newValue: '%',
        numberType: 'percentage',
      });

      expect(result).toEqual({ success: false });
    });

    it('should return success false when % is in the middle', () => {
      const result = getNumberValueToPersist({
        newValue: '1%2',
        numberType: 'percentage',
      });

      expect(result).toEqual({ success: false });
    });

    it('should return success false when multiple % symbols are present', () => {
      expect(
        getNumberValueToPersist({
          newValue: '%%50',
          numberType: 'percentage',
        }),
      ).toEqual({ success: false });

      expect(
        getNumberValueToPersist({
          newValue: '50%%',
          numberType: 'percentage',
        }),
      ).toEqual({ success: false });
    });

    it('should handle percentage with surrounding whitespace', () => {
      const result = getNumberValueToPersist({
        newValue: '  50 %  ',
        numberType: 'percentage',
      });

      expect(result).toEqual({ success: true, value: 0.5 });
    });
  });
});
