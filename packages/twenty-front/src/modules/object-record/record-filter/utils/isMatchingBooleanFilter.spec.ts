import { isMatchingBooleanFilter } from '@/object-record/record-filter/utils/isMatchingBooleanFilter';

describe('isMatchingBooleanFilter', () => {
  describe('eq', () => {
    it('value equals eq filter', () => {
      expect(
        isMatchingBooleanFilter({ booleanFilter: { eq: true }, value: true }),
      ).toBe(true);
    });

    it('value does not equal eq filter', () => {
      expect(
        isMatchingBooleanFilter({ booleanFilter: { eq: true }, value: false }),
      ).toBe(false);
    });
  });

  describe('is', () => {
    it('value is NULL', () => {
      expect(
        isMatchingBooleanFilter({
          booleanFilter: { is: 'NULL' },
          value: null as any,
        }),
      ).toBe(true);
    });

    it('value is NOT_NULL', () => {
      expect(
        isMatchingBooleanFilter({
          booleanFilter: { is: 'NOT_NULL' },
          value: true,
        }),
      ).toBe(true);
    });

    it('value is NOT_NULL and false', () => {
      expect(
        isMatchingBooleanFilter({
          booleanFilter: { is: 'NOT_NULL' },
          value: false,
        }),
      ).toBe(true);
    });
  });
});
