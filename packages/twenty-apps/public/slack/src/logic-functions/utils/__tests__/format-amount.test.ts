import { describe, expect, it } from 'vitest';

import { formatAmount } from 'src/logic-functions/utils/format-amount';

describe('formatAmount', () => {
  it('should format micros as a currency amount', () => {
    expect(
      formatAmount({ amountMicros: 1_500_000_000, currencyCode: 'USD' }),
    ).toBe('$1,500.00');
  });

  it('should fall back to a plain number for an unknown currency code', () => {
    expect(
      formatAmount({ amountMicros: 1_500_000_000, currencyCode: 'NOPE' }),
    ).toBe('1,500');
  });

  it('should format without a currency code', () => {
    expect(formatAmount({ amountMicros: 2_000_000 })).toBe('2');
  });

  it('should return undefined without a numeric amount', () => {
    expect(formatAmount(undefined)).toBeUndefined();
    expect(formatAmount({ currencyCode: 'USD' })).toBeUndefined();
    expect(formatAmount({ amountMicros: 'high' })).toBeUndefined();
  });
});
