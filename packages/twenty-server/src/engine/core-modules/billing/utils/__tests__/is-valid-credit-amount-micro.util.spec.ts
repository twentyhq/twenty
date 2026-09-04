import { isValidCreditAmountMicro } from 'src/engine/core-modules/billing/utils/is-valid-credit-amount-micro.util';

describe('isValidCreditAmountMicro', () => {
  it.each([
    ['a positive integer', 1_000_000],
    ['zero', 0],
    ['the largest safe integer', Number.MAX_SAFE_INTEGER],
  ])('should accept %s', (_case, amountMicro) => {
    expect(isValidCreditAmountMicro(amountMicro)).toBe(true);
  });

  it.each([
    ['a negative amount', -1],
    ['negative infinity', Number.NEGATIVE_INFINITY],
    ['positive infinity', Number.POSITIVE_INFINITY],
    ['NaN', Number.NaN],
    ['a fractional amount', 1_000.5],
    ['an amount beyond the safe integer range', Number.MAX_SAFE_INTEGER + 2],
  ])('should reject %s', (_case, amountMicro) => {
    expect(isValidCreditAmountMicro(amountMicro)).toBe(false);
  });
});
