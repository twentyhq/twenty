import { describe, expect, it } from 'vitest';

import { formatSlackUnfurlCurrencyAmount } from 'src/logic-functions/utils/format-slack-unfurl-currency-amount';

describe('formatSlackUnfurlCurrencyAmount', () => {
  it('should format micros with the currency code', () => {
    expect(
      formatSlackUnfurlCurrencyAmount({
        amountMicros: 10_000_000_000,
        currencyCode: 'USD',
      }),
    ).toBe('$10,000');
  });

  it('should keep cents for non-integer amounts', () => {
    expect(
      formatSlackUnfurlCurrencyAmount({
        amountMicros: 1_500_000,
        currencyCode: 'EUR',
      }),
    ).toBe('€1.50');
  });

  it('should accept string micros', () => {
    expect(
      formatSlackUnfurlCurrencyAmount({
        amountMicros: '2000000',
        currencyCode: 'USD',
      }),
    ).toBe('$2');
  });

  it('should format without a currency code', () => {
    expect(
      formatSlackUnfurlCurrencyAmount({ amountMicros: 2_000_000 }),
    ).toBe('2');
  });

  it('should return undefined for non numeric micros', () => {
    expect(
      formatSlackUnfurlCurrencyAmount({
        amountMicros: undefined,
        currencyCode: 'USD',
      }),
    ).toBeUndefined();
  });
});
