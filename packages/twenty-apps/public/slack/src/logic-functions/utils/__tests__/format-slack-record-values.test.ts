import { describe, expect, it } from 'vitest';

import { formatSlackRecordAmount } from 'src/logic-functions/utils/format-slack-record-amount';
import { formatSlackRecordDate } from 'src/logic-functions/utils/format-slack-record-date';
import { formatSlackRecordSelectValue } from 'src/logic-functions/utils/format-slack-record-select-value';

describe('formatSlackRecordSelectValue', () => {
  it('should turn SCREAMING_SNAKE_CASE option values into readable labels', () => {
    expect(formatSlackRecordSelectValue('NEW_CUSTOMER')).toBe('New customer');
    expect(formatSlackRecordSelectValue('PROPOSAL')).toBe('Proposal');
  });

  it('should leave values that are not option api names untouched', () => {
    expect(formatSlackRecordSelectValue('Won deal')).toBe('Won deal');
  });
});

describe('formatSlackRecordAmount', () => {
  it('should format micros with the currency symbol and thousands separators', () => {
    expect(
      formatSlackRecordAmount({
        amountMicros: 12500000000,
        currencyCode: 'USD',
      }),
    ).toBe('$12,500');
  });

  it('should keep cents when the amount is not a whole number', () => {
    expect(
      formatSlackRecordAmount({ amountMicros: 458640000, currencyCode: 'EUR' }),
    ).toBe('€458.64');
  });

  it('should fall back to a plain number for an unknown currency code', () => {
    expect(
      formatSlackRecordAmount({
        amountMicros: 1000000000,
        currencyCode: 'NOT_A_CODE',
      }),
    ).toBe('1,000');
  });
});

describe('formatSlackRecordDate', () => {
  it('should hide the year for dates in the current year', () => {
    const now = new Date('2099-06-01T00:00:00.000Z');

    expect(formatSlackRecordDate('2099-01-05T00:00:00.000Z', now)).toBe(
      'Jan 5',
    );
  });

  it('should show the year for other years', () => {
    const now = new Date('2099-06-01T00:00:00.000Z');

    expect(formatSlackRecordDate('2098-01-05T00:00:00.000Z', now)).toBe(
      'Jan 5, 2098',
    );
  });

  it('should return undefined for an unparseable date', () => {
    expect(formatSlackRecordDate('not-a-date')).toBeUndefined();
  });
});
