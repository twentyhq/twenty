import { getCurrencyFilterDisplayValue } from '@/object-record/object-filter-dropdown/utils/getCurrencyFilterDisplayValue';

describe('getCurrencyFilterDisplayValue', () => {
  it('should join up to three currency names', () => {
    expect(
      getCurrencyFilterDisplayValue(['Euro (EUR)', 'US Dollar (USD)']),
    ).toBe('Euro (EUR), US Dollar (USD)');
  });

  it('should count the currencies when there are more than three', () => {
    expect(
      getCurrencyFilterDisplayValue([
        'Euro (EUR)',
        'US Dollar (USD)',
        'Japanese Yen (JPY)',
        'Swiss Franc (CHF)',
      ]),
    ).toBe('4 currencies');
  });
});
