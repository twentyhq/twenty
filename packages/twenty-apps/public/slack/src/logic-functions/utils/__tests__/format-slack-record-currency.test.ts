import { describe, expect, it } from 'vitest';

import { formatSlackRecordCurrency } from 'src/logic-functions/utils/format-slack-record-currency';

describe('formatSlackRecordCurrency', () => {
  it('should write a round amount with its symbol and thousands separators', () => {
    expect(
      formatSlackRecordCurrency({
        amountMicros: '12500000000',
        currencyCode: 'USD',
      }),
    ).toBe('$12,500');
  });

  it('should keep cents when the amount has them', () => {
    expect(
      formatSlackRecordCurrency({
        amountMicros: 1250500000,
        currencyCode: 'USD',
      }),
    ).toBe('$1,250.50');
  });

  it('should write the plain amount when the currency is unknown', () => {
    expect(formatSlackRecordCurrency({ amountMicros: '5000000' })).toBe('5');
  });

  it('should return nothing when the field is empty', () => {
    expect(formatSlackRecordCurrency(null)).toBeUndefined();
    expect(formatSlackRecordCurrency({ currencyCode: 'USD' })).toBeUndefined();
  });
});
