import {
  convertCurrencyAmountToCurrencyMicros,
  convertCurrencyMicrosToCurrencyAmount,
} from '~/utils/convertCurrencyToCurrencyMicros';

describe('convertCurrencyAmountToCurrencyMicros', () => {
  it('should throw an error if currencyAmount converted to micros is not a whole number', () => {
    expect(() => convertCurrencyAmountToCurrencyMicros(1.023)).toThrow(
      'Cannot convert 1.023 to micros',
    );
  });

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
