import {
  convertCurrencyAmountToCurrencyMicros,
  convertCurrencyMicrosToCurrencyAmount,
} from '~/utils/convertCurrencyToCurrencyMicros';

describe('convertCurrencyAmountToCurrencyMicros', () => {
  it.each([
    [0.000249, 249],
    [-0.000249, -249],
    [3.21, 3210000],
  ])(
    'converts %s to integer micros %s without floating-point residue',
    (amount, micros) => {
      expect(convertCurrencyAmountToCurrencyMicros(amount)).toBe(micros);
    },
  );

  it('should convert currencyAmount to micros', () => {
    expect(convertCurrencyAmountToCurrencyMicros(1)).toBe(1000000);
    expect(convertCurrencyAmountToCurrencyMicros(1.5)).toBe(1500000);
  });
});

describe('convertCurrencyMicrosToCurrencyAmount', () => {
  it('should convert currency micros to currency', () => {
    expect(convertCurrencyMicrosToCurrencyAmount(24000000)).toBe(24);
  });
});
