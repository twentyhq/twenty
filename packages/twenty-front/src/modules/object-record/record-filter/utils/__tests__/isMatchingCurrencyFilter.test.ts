import { CurrencyFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { isMatchingCurrencyFilter } from '@/object-record/record-filter/utils/isMatchingCurrencyFilter';

describe('isMatchingCurrencyFilter', () => {
  describe('eq', () => {
    it('value equals eq filter', () => {
      const currencyFilter: CurrencyFilter = {
        amountMicros: { eq: 10 },
      };
      expect(isMatchingCurrencyFilter({ currencyFilter, value: 10 })).toBe(
        true,
      );
    });

    it('value does not equal eq filter', () => {
      const currencyFilter: CurrencyFilter = {
        amountMicros: { eq: 10 },
      };
      expect(isMatchingCurrencyFilter({ currencyFilter, value: 20 })).toBe(
        false,
      );
    });
  });

  describe('gt', () => {
    it('value is greater than gt filter', () => {
      const currencyFilter: CurrencyFilter = {
        amountMicros: { gt: 10 },
      };
      expect(isMatchingCurrencyFilter({ currencyFilter, value: 20 })).toBe(
        true,
      );
    });

    it('value is not greater than gt filter', () => {
      const currencyFilter: CurrencyFilter = {
        amountMicros: { gt: 20 },
      };
      expect(isMatchingCurrencyFilter({ currencyFilter, value: 10 })).toBe(
        false,
      );
    });
  });

  describe('gte', () => {
    it('value is greater than or equal to gte filter', () => {
      const currencyFilter: CurrencyFilter = {
        amountMicros: { gte: 10 },
      };
      expect(isMatchingCurrencyFilter({ currencyFilter, value: 10 })).toBe(
        true,
      );
    });

    it('value is not greater than or equal to gte filter', () => {
      const currencyFilter: CurrencyFilter = {
        amountMicros: { gte: 20 },
      };
      expect(isMatchingCurrencyFilter({ currencyFilter, value: 10 })).toBe(
        false,
      );
    });
  });

  describe('in', () => {
    it('value is in the array', () => {
      const currencyFilter: CurrencyFilter = {
        amountMicros: { in: [10, 20, 30] },
      };
      expect(isMatchingCurrencyFilter({ currencyFilter, value: 20 })).toBe(
        true,
      );
    });

    it('value is not in the array', () => {
      const currencyFilter: CurrencyFilter = {
        amountMicros: { in: [10, 30, 40] },
      };
      expect(isMatchingCurrencyFilter({ currencyFilter, value: 20 })).toBe(
        false,
      );
    });
  });

  describe('lt', () => {
    it('value is less than lt filter', () => {
      const currencyFilter: CurrencyFilter = {
        amountMicros: { lt: 20 },
      };
      expect(isMatchingCurrencyFilter({ currencyFilter, value: 10 })).toBe(
        true,
      );
    });

    it('value is not less than lt filter', () => {
      const currencyFilter: CurrencyFilter = {
        amountMicros: { lt: 10 },
      };
      expect(isMatchingCurrencyFilter({ currencyFilter, value: 20 })).toBe(
        false,
      );
    });
  });

  describe('lte', () => {
    it('value is less than or equal to lte filter', () => {
      const currencyFilter: CurrencyFilter = {
        amountMicros: { lte: 20 },
      };
      expect(isMatchingCurrencyFilter({ currencyFilter, value: 20 })).toBe(
        true,
      );
    });

    it('value is not less than or equal to lte filter', () => {
      const currencyFilter: CurrencyFilter = {
        amountMicros: { lte: 10 },
      };
      expect(isMatchingCurrencyFilter({ currencyFilter, value: 20 })).toBe(
        false,
      );
    });
  });

  describe('neq', () => {
    it('value does not equal neq filter', () => {
      const currencyFilter: CurrencyFilter = {
        amountMicros: { neq: 10 },
      };
      expect(isMatchingCurrencyFilter({ currencyFilter, value: 20 })).toBe(
        true,
      );
    });

    it('value equals neq filter', () => {
      const currencyFilter: CurrencyFilter = {
        amountMicros: { neq: 10 },
      };
      expect(isMatchingCurrencyFilter({ currencyFilter, value: 10 })).toBe(
        false,
      );
    });
  });

  describe('is', () => {
    it('value is NULL', () => {
      const currencyFilter: CurrencyFilter = {
        amountMicros: { is: 'NULL' },
      };
      expect(
        isMatchingCurrencyFilter({ currencyFilter, value: null as any }),
      ).toBe(true);
    });

    it('value is NOT_NULL', () => {
      const currencyFilter: CurrencyFilter = {
        amountMicros: { is: 'NOT_NULL' },
      };
      expect(isMatchingCurrencyFilter({ currencyFilter, value: 10 })).toBe(
        true,
      );
    });
  });
});
