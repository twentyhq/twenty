import { describe, expect, it } from 'vitest';

import {
  formatSlackUnfurlCurrencyAmount,
  formatSlackUnfurlDate,
  formatSlackUnfurlSelectValue,
} from 'src/logic-functions/utils/format-slack-unfurl-field-values';

describe('formatSlackUnfurlSelectValue', () => {
  it('should humanize snake case option values', () => {
    expect(formatSlackUnfurlSelectValue('MEETING_SCHEDULED')).toBe(
      'Meeting scheduled',
    );
    expect(formatSlackUnfurlSelectValue('NEW')).toBe('New');
    expect(formatSlackUnfurlSelectValue('IN_PROGRESS')).toBe('In progress');
  });

  it('should return undefined for empty values', () => {
    expect(formatSlackUnfurlSelectValue('')).toBeUndefined();
    expect(formatSlackUnfurlSelectValue('___')).toBeUndefined();
  });
});

describe('formatSlackUnfurlDate', () => {
  it('should format iso dates compactly', () => {
    expect(formatSlackUnfurlDate('2026-03-14')).toBe('Mar 14, 2026');
    expect(formatSlackUnfurlDate('2026-03-14T10:30:00.000Z')).toBe(
      'Mar 14, 2026',
    );
  });

  it('should return undefined for invalid dates', () => {
    expect(formatSlackUnfurlDate('not-a-date')).toBeUndefined();
  });
});

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
