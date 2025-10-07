import { isMatchingCurrencyFilter } from '@/object-record/record-filter/utils/isMatchingCurrencyFilter';
import { type CurrencyFilter } from 'twenty-shared/types';

describe('isMatchingCurrencyFilter', () => {
  describe('amountMicros', () => {
    describe('eq', () => {
      it('value equals eq filter', () => {
        const currencyFilter: CurrencyFilter = {
          amountMicros: { eq: 10 },
        };
        expect(
          isMatchingCurrencyFilter({
            currencyFilter,
            value: {
              amountMicros: 10,
            },
          }),
        ).toBe(true);
      });

      it('value does not equal eq filter', () => {
        const currencyFilter: CurrencyFilter = {
          amountMicros: { eq: 10 },
        };
        expect(
          isMatchingCurrencyFilter({
            currencyFilter,
            value: { amountMicros: 20 },
          }),
        ).toBe(false);
      });
    });

    describe('gt', () => {
      it('value is greater than gt filter', () => {
        const currencyFilter: CurrencyFilter = {
          amountMicros: { gt: 10 },
        };
        expect(
          isMatchingCurrencyFilter({
            currencyFilter,
            value: { amountMicros: 20 },
          }),
        ).toBe(true);
      });

      it('value is not greater than gt filter', () => {
        const currencyFilter: CurrencyFilter = {
          amountMicros: { gt: 20 },
        };
        expect(
          isMatchingCurrencyFilter({
            currencyFilter,
            value: { amountMicros: 10 },
          }),
        ).toBe(false);
      });
    });

    describe('gte', () => {
      it('value is greater than or equal to gte filter', () => {
        const currencyFilter: CurrencyFilter = {
          amountMicros: { gte: 10 },
        };
        expect(
          isMatchingCurrencyFilter({
            currencyFilter,
            value: { amountMicros: 10 },
          }),
        ).toBe(true);
      });

      it('value is not greater than or equal to gte filter', () => {
        const currencyFilter: CurrencyFilter = {
          amountMicros: { gte: 20 },
        };
        expect(
          isMatchingCurrencyFilter({
            currencyFilter,
            value: { amountMicros: 10 },
          }),
        ).toBe(false);
      });
    });

    describe('lt', () => {
      it('value is less than lt filter', () => {
        const currencyFilter: CurrencyFilter = {
          amountMicros: { lt: 20 },
        };
        expect(
          isMatchingCurrencyFilter({
            currencyFilter,
            value: { amountMicros: 10 },
          }),
        ).toBe(true);
      });

      it('value is not less than lt filter', () => {
        const currencyFilter: CurrencyFilter = {
          amountMicros: { lt: 10 },
        };
        expect(
          isMatchingCurrencyFilter({
            currencyFilter,
            value: { amountMicros: 20 },
          }),
        ).toBe(false);
      });
    });

    describe('lte', () => {
      it('value is less than or equal to lte filter', () => {
        const currencyFilter: CurrencyFilter = {
          amountMicros: { lte: 20 },
        };
        expect(
          isMatchingCurrencyFilter({
            currencyFilter,
            value: { amountMicros: 20 },
          }),
        ).toBe(true);
      });

      it('value is not less than or equal to lte filter', () => {
        const currencyFilter: CurrencyFilter = {
          amountMicros: { lte: 10 },
        };
        expect(
          isMatchingCurrencyFilter({
            currencyFilter,
            value: { amountMicros: 20 },
          }),
        ).toBe(false);
      });
    });

    describe('neq', () => {
      it('value does not equal neq filter', () => {
        const currencyFilter: CurrencyFilter = {
          amountMicros: { neq: 10 },
        };
        expect(
          isMatchingCurrencyFilter({
            currencyFilter,
            value: { amountMicros: 20 },
          }),
        ).toBe(true);
      });

      it('value equals neq filter', () => {
        const currencyFilter: CurrencyFilter = {
          amountMicros: { neq: 10 },
        };
        expect(
          isMatchingCurrencyFilter({
            currencyFilter,
            value: { amountMicros: 10 },
          }),
        ).toBe(false);
      });
    });

    describe('is', () => {
      it('value is NULL', () => {
        const currencyFilter: CurrencyFilter = {
          amountMicros: { is: 'NULL' },
        };
        expect(
          isMatchingCurrencyFilter({
            currencyFilter,
            value: { amountMicros: null as any },
          }),
        ).toBe(true);
      });

      it('value is NOT_NULL', () => {
        const currencyFilter: CurrencyFilter = {
          amountMicros: { is: 'NOT_NULL' },
        };
        expect(
          isMatchingCurrencyFilter({
            currencyFilter,
            value: { amountMicros: 10 },
          }),
        ).toBe(true);
      });
    });
  });

  describe('currencyCode', () => {
    describe('in', () => {
      it('value is in filter array', () => {
        const currencyFilter: CurrencyFilter = {
          currencyCode: { in: ['USD'] },
        };

        expect(
          isMatchingCurrencyFilter({
            currencyFilter,
            value: { currencyCode: 'USD' },
          }),
        ).toBe(true);
      });

      it('value is not in filter array', () => {
        const currencyFilter: CurrencyFilter = {
          currencyCode: { in: ['USD'] },
        };

        expect(
          isMatchingCurrencyFilter({
            currencyFilter,
            value: { currencyCode: 'EUR' },
          }),
        ).toBe(false);
      });
    });

    describe('is', () => {
      it('value is NULL', () => {
        const currencyFilter: CurrencyFilter = {
          currencyCode: { is: 'NULL' },
        };
        expect(
          isMatchingCurrencyFilter({
            currencyFilter,
            value: { currencyCode: null as any },
          }),
        ).toBe(true);
      });

      it('value is NOT_NULL', () => {
        const currencyFilter: CurrencyFilter = {
          currencyCode: { is: 'NOT_NULL' },
        };
        expect(
          isMatchingCurrencyFilter({
            currencyFilter,
            value: { currencyCode: 'USD' },
          }),
        ).toBe(true);
      });
    });
  });

  describe('both filters', () => {
    it('both filters match', () => {
      const currencyFilter: CurrencyFilter = {
        amountMicros: { eq: 10 },
        currencyCode: { in: ['USD'] },
      };
      expect(
        isMatchingCurrencyFilter({
          currencyFilter,
          value: {
            amountMicros: 10,
            currencyCode: 'USD',
          },
        }),
      ).toBe(true);
    });

    it('amount micros filter does not match', () => {
      const currencyFilter: CurrencyFilter = {
        amountMicros: { eq: 10 },
        currencyCode: { in: ['USD'] },
      };
      expect(
        isMatchingCurrencyFilter({
          currencyFilter,
          value: {
            amountMicros: 20,
            currencyCode: 'USD',
          },
        }),
      ).toBe(false);
    });

    it('currency code filter does not match', () => {
      const currencyFilter: CurrencyFilter = {
        amountMicros: { eq: 10 },
        currencyCode: { in: ['USD'] },
      };
      expect(
        isMatchingCurrencyFilter({
          currencyFilter,
          value: {
            amountMicros: 10,
            currencyCode: 'EUR',
          },
        }),
      ).toBe(false);
    });
  });

  describe('no filters', () => {
    it('no filters match', () => {
      const currencyFilter: CurrencyFilter = {};

      expect(() =>
        isMatchingCurrencyFilter({
          currencyFilter,
          value: {
            amountMicros: 10,
            currencyCode: 'USD',
          },
        }),
      ).toThrowError('Unexpected filter for currency : {}');
    });
  });

  describe('unexpected operand', () => {
    it('throws an error for unexpected operand', () => {
      const currencyFilter: any = {
        amountMicros: { unexpected: 10 },
      };
      expect(() =>
        isMatchingCurrencyFilter({
          currencyFilter,
          value: { amountMicros: 10 },
        }),
      ).toThrowError(
        'Unexpected operand for currency amount micros filter : {"unexpected":10}',
      );
    });
  });
});
