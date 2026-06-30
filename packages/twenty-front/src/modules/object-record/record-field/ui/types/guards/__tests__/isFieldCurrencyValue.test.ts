import { isFieldCurrencyValue } from '@/object-record/record-field/ui/types/guards/isFieldCurrencyValue';

describe('isFieldCurrencyValue', () => {
  it('should return true for valid currency values', () => {
    expect(
      isFieldCurrencyValue({ currencyCode: 'USD', amountMicros: 1000000 }),
    ).toBe(true);
    expect(
      isFieldCurrencyValue({ currencyCode: null, amountMicros: null }),
    ).toBe(true);
    expect(isFieldCurrencyValue({ currencyCode: '', amountMicros: null })).toBe(
      true,
    );
  });

  it('should return false for invalid currency values', () => {
    expect(isFieldCurrencyValue({ currencyCode: 'INVALID' })).toBe(false);
    expect(isFieldCurrencyValue(null)).toBe(false);
    expect(isFieldCurrencyValue('USD')).toBe(false);
  });
});
