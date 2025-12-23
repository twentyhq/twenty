import { isMatchingArrayFilter } from '@/object-record/record-filter/utils/isMatchingArrayFilter';

describe('isMatchingArrayFilter', () => {
  describe('is filter', () => {
    it('should return true when checking for NULL and value is null', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { is: 'NULL' },
          value: null,
        }),
      ).toBe(true);
    });

    it('should return false when checking for NULL and value is not null', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { is: 'NULL' },
          value: ['test'],
        }),
      ).toBe(false);
    });

    it('should return true when checking for NOT_NULL and value is not null', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { is: 'NOT_NULL' },
          value: ['test'],
        }),
      ).toBe(true);
    });

    it('should return false when checking for NOT_NULL and value is null', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { is: 'NOT_NULL' },
          value: null,
        }),
      ).toBe(false);
    });
  });

  describe('isEmptyArray filter', () => {
    it('should return true when array is empty and checking for empty array', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { isEmptyArray: true },
          value: [],
        }),
      ).toBe(true);
    });

    it('should return false when array is not empty and checking for empty array', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { isEmptyArray: true },
          value: ['test'],
        }),
      ).toBe(false);
    });

    it('should return false when value is null and checking for empty array', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { isEmptyArray: true },
          value: null,
        }),
      ).toBe(false);
    });
  });

  describe('containsIlike filter', () => {
    it('should return true when array contains item matching case-insensitive search', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { containsIlike: 'TEST' },
          value: ['test item'],
        }),
      ).toBe(true);
    });

    it('should return false when array does not contain item matching search', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { containsIlike: 'missing' },
          value: ['test item'],
        }),
      ).toBe(false);
    });

    it('should return false when value is null and using containsIlike', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { containsIlike: 'test' },
          value: null,
        }),
      ).toBe(false);
    });

    it('should match partial strings case-insensitively', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { containsIlike: 'TE' },
          value: ['Test Item', 'Another Item'],
        }),
      ).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid filter', () => {
      expect(() =>
        isMatchingArrayFilter({
          arrayFilter: {},
          value: [],
        }),
      ).toThrow('Unexpected value for array filter');
    });

    it('should throw error for unknown filter type', () => {
      expect(() =>
        isMatchingArrayFilter({
          arrayFilter: { unknownFilter: 'test' } as any,
          value: [],
        }),
      ).toThrow('Unexpected value for array filter');
    });
  });
});
