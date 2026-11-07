import { CurrencyCode } from 'twenty-shared/constants';

import { isCurrencyCodeSelectable } from '@/ui/input/components/internal/currency/utils/isCurrencyCodeSelectable';

describe('isCurrencyCodeSelectable', () => {
  it('hides a withdrawn currency code', () => {
    expect(
      isCurrencyCodeSelectable({
        currencyCode: CurrencyCode.ANG,
        selectedCurrencyCode: CurrencyCode.USD,
      }),
    ).toBe(false);
  });

  it('keeps a withdrawn currency code that is already selected', () => {
    expect(
      isCurrencyCodeSelectable({
        currencyCode: CurrencyCode.ANG,
        selectedCurrencyCode: CurrencyCode.ANG,
      }),
    ).toBe(true);
  });

  it('keeps its replacement and other current currency codes', () => {
    expect(isCurrencyCodeSelectable({ currencyCode: CurrencyCode.XCG })).toBe(
      true,
    );
    expect(isCurrencyCodeSelectable({ currencyCode: CurrencyCode.USD })).toBe(
      true,
    );
  });
});
