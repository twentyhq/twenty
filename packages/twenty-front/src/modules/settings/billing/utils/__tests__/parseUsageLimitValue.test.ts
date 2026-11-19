import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';

import { parseUsageLimitValue } from '@/settings/billing/utils/parseUsageLimitValue';

describe('parseUsageLimitValue', () => {
  it('converts typed credits to micro-credits', () => {
    expect(
      parseUsageLimitValue({
        value: '0.83',
        min: 0,
        scale: INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
      }),
    ).toBe(830_000);
  });

  it('keeps a count as typed', () => {
    expect(parseUsageLimitValue({ value: '200', min: 1, scale: 1 })).toBe(200);
  });

  it('accepts zero when the minimum allows it', () => {
    expect(
      parseUsageLimitValue({
        value: '0',
        min: 0,
        scale: INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
      }),
    ).toBe(0);
  });

  it('refuses a blank value instead of reading it as zero', () => {
    expect(parseUsageLimitValue({ value: ' ', min: 0, scale: 1 })).toBeNull();
  });

  it('refuses a value below the minimum', () => {
    expect(parseUsageLimitValue({ value: '0', min: 1, scale: 1 })).toBeNull();
    expect(parseUsageLimitValue({ value: '-1', min: 0, scale: 1 })).toBeNull();
  });

  it('refuses a positive value too small to store', () => {
    expect(
      parseUsageLimitValue({
        value: '0.0000001',
        min: 0,
        scale: INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
      }),
    ).toBeNull();
  });

  it('refuses a value that is not a number', () => {
    expect(parseUsageLimitValue({ value: 'abc', min: 0, scale: 1 })).toBeNull();
  });
});
