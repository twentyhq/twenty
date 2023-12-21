import { isMatchingFloatFilter } from '@/object-record/record-filter/utils/isMatchingFloatFilter';

describe('isMatchingFloatFilter', () => {
  describe('eq', () => {
    it('value equals eq filter', () => {
      expect(
        isMatchingFloatFilter({ floatFilter: { eq: 10 }, value: 10 }),
      ).toBe(true);
    });

    it('value does not equal eq filter', () => {
      expect(
        isMatchingFloatFilter({ floatFilter: { eq: 10 }, value: 20 }),
      ).toBe(false);
    });
  });

  describe('neq', () => {
    it('value does not equal neq filter', () => {
      expect(
        isMatchingFloatFilter({ floatFilter: { neq: 10 }, value: 20 }),
      ).toBe(true);
    });

    it('value equals neq filter', () => {
      expect(
        isMatchingFloatFilter({ floatFilter: { neq: 10 }, value: 10 }),
      ).toBe(false);
    });
  });

  describe('gt', () => {
    it('value is greater than gt filter', () => {
      expect(
        isMatchingFloatFilter({ floatFilter: { gt: 10 }, value: 20 }),
      ).toBe(true);
    });

    it('value is not greater than gt filter', () => {
      expect(
        isMatchingFloatFilter({ floatFilter: { gt: 20 }, value: 10 }),
      ).toBe(false);
    });
  });

  describe('gte', () => {
    it('value is greater than or equal to gte filter', () => {
      expect(
        isMatchingFloatFilter({ floatFilter: { gte: 10 }, value: 10 }),
      ).toBe(true);
    });

    it('value is not greater than or equal to gte filter', () => {
      expect(
        isMatchingFloatFilter({ floatFilter: { gte: 20 }, value: 10 }),
      ).toBe(false);
    });
  });

  describe('lt', () => {
    it('value is less than lt filter', () => {
      expect(
        isMatchingFloatFilter({ floatFilter: { lt: 20 }, value: 10 }),
      ).toBe(true);
    });

    it('value is not less than lt filter', () => {
      expect(
        isMatchingFloatFilter({ floatFilter: { lt: 10 }, value: 20 }),
      ).toBe(false);
    });
  });

  describe('lte', () => {
    it('value is less than or equal to lte filter', () => {
      expect(
        isMatchingFloatFilter({ floatFilter: { lte: 10 }, value: 10 }),
      ).toBe(true);
    });

    it('value is not less than or equal to lte filter', () => {
      expect(
        isMatchingFloatFilter({ floatFilter: { lte: 10 }, value: 20 }),
      ).toBe(false);
    });
  });

  describe('in', () => {
    it('value is in the array', () => {
      expect(
        isMatchingFloatFilter({ floatFilter: { in: [10, 20, 30] }, value: 20 }),
      ).toBe(true);
    });

    it('value is not in the array', () => {
      expect(
        isMatchingFloatFilter({ floatFilter: { in: [10, 30, 40] }, value: 20 }),
      ).toBe(false);
    });
  });

  describe('is', () => {
    it('value is NULL', () => {
      expect(
        isMatchingFloatFilter({
          floatFilter: { is: 'NULL' },
          value: null as any,
        }),
      ).toBe(true);
    });

    it('value is NOT_NULL', () => {
      expect(
        isMatchingFloatFilter({ floatFilter: { is: 'NOT_NULL' }, value: 10 }),
      ).toBe(true);
    });
  });
});
