import { getSafeScaleForCurrencyInput } from '~/utils/format/getSafeScaleForCurrencyInput';

describe('getSafeScaleForCurrencyInput', () => {
  it('returns the existing decimal precision when it is greater than the configured decimals', () => {
    expect(
      getSafeScaleForCurrencyInput({
        value: '458.64',
        decimals: 0,
      }),
    ).toBe(2);
  });

  it('returns 0 for whole numbers', () => {
    expect(
      getSafeScaleForCurrencyInput({
        value: '458',
        decimals: 0,
      }),
    ).toBe(0);
  });

  it('returns the configured decimals when greater than the existing precision', () => {
    expect(
      getSafeScaleForCurrencyInput({
        value: '458.64',
        decimals: 4,
      }),
    ).toBe(4);
  });

  it('returns the existing precision for one decimal place', () => {
    expect(
      getSafeScaleForCurrencyInput({
        value: '458.6',
        decimals: 0,
      }),
    ).toBe(1);
  });

  it('returns configured decimals for an empty value', () => {
    expect(
      getSafeScaleForCurrencyInput({
        value: '',
        decimals: 2,
      }),
    ).toBe(2);
  });
});
