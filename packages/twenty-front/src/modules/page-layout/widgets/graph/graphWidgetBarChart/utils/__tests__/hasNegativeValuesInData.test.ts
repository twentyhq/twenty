import { hasNegativeValuesInData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/hasNegativeValuesInData';

describe('hasNegativeValuesInData', () => {
  describe('positive values only', () => {
    it('should return false when all values are positive', () => {
      const data = [
        { category: 'A', value1: 10, value2: 20 },
        { category: 'B', value1: 30, value2: 40 },
      ];

      const result = hasNegativeValuesInData(data, ['value1', 'value2']);

      expect(result).toBe(false);
    });

    it('should return false when all values are zero', () => {
      const data = [
        { category: 'A', value1: 0, value2: 0 },
        { category: 'B', value1: 0, value2: 0 },
      ];

      const result = hasNegativeValuesInData(data, ['value1', 'value2']);

      expect(result).toBe(false);
    });
  });

  describe('negative values', () => {
    it('should return true when any value is negative', () => {
      const data = [
        { category: 'A', value1: 10, value2: -20 },
        { category: 'B', value1: 30, value2: 40 },
      ];

      const result = hasNegativeValuesInData(data, ['value1', 'value2']);

      expect(result).toBe(true);
    });

    it('should return true when all values are negative', () => {
      const data = [
        { category: 'A', value1: -10, value2: -20 },
        { category: 'B', value1: -30, value2: -40 },
      ];

      const result = hasNegativeValuesInData(data, ['value1', 'value2']);

      expect(result).toBe(true);
    });

    it('should return true when first value is negative', () => {
      const data = [{ category: 'A', value1: -1 }];

      const result = hasNegativeValuesInData(data, ['value1']);

      expect(result).toBe(true);
    });
  });

  describe('empty data', () => {
    it('should return false when data is empty', () => {
      const result = hasNegativeValuesInData([], ['value1', 'value2']);

      expect(result).toBe(false);
    });

    it('should return false when keys is empty', () => {
      const data = [{ category: 'A', value1: -10 }];

      const result = hasNegativeValuesInData(data, []);

      expect(result).toBe(false);
    });
  });

  describe('missing keys', () => {
    it('should return false when key does not exist in data', () => {
      const data = [{ category: 'A', value1: 10 }];

      const result = hasNegativeValuesInData(data, ['nonExistentKey']);

      expect(result).toBe(false);
    });

    it('should check only specified keys', () => {
      const data = [{ category: 'A', value1: -10, value2: 20 }];

      const result = hasNegativeValuesInData(data, ['value2']);

      expect(result).toBe(false);
    });
  });

  describe('non-numeric values', () => {
    it('should skip string values', () => {
      const data = [{ category: 'A', value1: 'not a number', value2: 20 }];

      const result = hasNegativeValuesInData(data, ['value1', 'value2']);

      expect(result).toBe(false);
    });
  });

  describe('early exit optimization', () => {
    it('should return true as soon as first negative is found', () => {
      const data = [
        { category: 'A', value1: -1, value2: 20 },
        { category: 'B', value1: 30, value2: 40 },
        { category: 'C', value1: 50, value2: 60 },
      ];

      const result = hasNegativeValuesInData(data, ['value1', 'value2']);

      expect(result).toBe(true);
    });
  });
});
