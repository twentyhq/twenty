import { getSafeScaleForCurrencyInput } from '@/ui/field/input/utils/getSafeScaleForCurrencyInput';

describe('getSafeScaleForCurrencyInput', () => {
  it('returns configured decimals when draft value has no decimal part', () => {
    expect(getSafeScaleForCurrencyInput('458', 0)).toBe(0);
    expect(getSafeScaleForCurrencyInput('458', 2)).toBe(2);
  });

  it('widens scale to decimal precision present in draft value when it exceeds configured decimals', () => {
    expect(getSafeScaleForCurrencyInput('458.64', 0)).toBe(2);
    expect(getSafeScaleForCurrencyInput('458.6432', 2)).toBe(4);
  });

  it('honors configured decimals when configured decimals is greater than draft precision', () => {
    expect(getSafeScaleForCurrencyInput('458.6', 2)).toBe(2);
  });

  it('handles empty value string gracefully', () => {
    expect(getSafeScaleForCurrencyInput('', 0)).toBe(0);
    expect(getSafeScaleForCurrencyInput('', 2)).toBe(2);
  });
});
