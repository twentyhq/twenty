import { describe, expect, it } from 'vitest';

import { buildCurrencyFromUsd } from 'src/logic-functions/utils/build-currency-from-usd';

describe('buildCurrencyFromUsd', () => {
  it('converts a USD amount to micros', () => {
    expect(buildCurrencyFromUsd(1234.5)).toEqual({
      amountMicros: 1_234_500_000,
      currencyCode: 'USD',
    });
  });

  it('returns undefined for non-finite or non-number input', () => {
    expect(buildCurrencyFromUsd(Number.NaN)).toBeUndefined();
    expect(buildCurrencyFromUsd('1000')).toBeUndefined();
  });
});
