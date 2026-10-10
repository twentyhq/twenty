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
});
