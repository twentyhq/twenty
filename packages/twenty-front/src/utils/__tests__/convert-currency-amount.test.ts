import {
  convertCurrencyMicrosToCurrency,
  convertCurrencyToCurrencyMicros,
} from '~/utils/convert-currency-amount';

describe('convertCurrencyToCurrencyMicros', () => {
  it('should return null if currencyAmount is null', () => {
    expect(convertCurrencyToCurrencyMicros(null)).toBeNull();
  });

  it('should throw an error if currencyAmount converted to micros is not a whole number', () => {
    expect(() => convertCurrencyToCurrencyMicros(1.023)).toThrow(
      'Cannot convert 1.023 to micros',
    );
  });

  it('should convert currencyAmount to micros', () => {
    expect(convertCurrencyToCurrencyMicros(1)).toBe(1000000);
    expect(convertCurrencyToCurrencyMicros(1.5)).toBe(1500000);
  });
});

describe('convertCurrencyMicrosToCurrency', () => {
  it('should return null if currencyAmountMicros is null', () => {
    expect(convertCurrencyMicrosToCurrency(null)).toBeNull();
  });

  it('should return null if currencyAmountMicros is undefined', () => {
    expect(convertCurrencyMicrosToCurrency(undefined)).toBeNull();
  });

  it('should convert currency micros to currency', () => {
    expect(convertCurrencyMicrosToCurrency(24000000)).toBe(24);
  });
});
