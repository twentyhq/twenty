import { CurrencyCode } from 'twenty-shared/constants';

import { getCurrencyLabel } from '@/localization/utils/getCurrencyLabel';

describe('getCurrencyLabel', () => {
  it('should keep the source label for the source locale', () => {
    expect(
      getCurrencyLabel({ currencyCode: CurrencyCode.USD, locale: 'en' }),
    ).toBe('United States dollar');
  });

  it('should use the currency name of the locale', () => {
    expect(
      getCurrencyLabel({ currencyCode: CurrencyCode.EUR, locale: 'fr-FR' }),
    ).toBe('euro');
  });

  it('should fall back to the source label for an invalid locale', () => {
    expect(
      getCurrencyLabel({ currencyCode: CurrencyCode.USD, locale: '%%' }),
    ).toBe('United States dollar');
  });

  it('should name a valid currency missing from the source labels', () => {
    expect(getCurrencyLabel({ currencyCode: 'XCG', locale: 'en' })).toBe(
      'Caribbean guilder',
    );
  });

  it('should fall back to the code for an unknown currency', () => {
    expect(getCurrencyLabel({ currencyCode: 'XYZ', locale: 'en' })).toBe('XYZ');
  });

  it('should not crash on an empty currency code', () => {
    expect(getCurrencyLabel({ currencyCode: '', locale: 'en' })).toBe('');
  });
});
