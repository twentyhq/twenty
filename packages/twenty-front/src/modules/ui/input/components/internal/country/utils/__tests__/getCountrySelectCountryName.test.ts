import { getCountrySelectCountryName } from '@/ui/input/components/internal/country/utils/getCountrySelectCountryName';
import { type Country } from '@/ui/input/components/internal/types/Country';

const COUNTRIES: Pick<Country, 'countryCode' | 'countryName'>[] = [
  { countryCode: 'FR', countryName: 'France' },
  { countryCode: 'BR', countryName: 'Brazil' },
];

describe('getCountrySelectCountryName', () => {
  it('persists the original source country name for a selected identifier', () => {
    expect(
      getCountrySelectCountryName({ countries: COUNTRIES, countryCode: 'BR' }),
    ).toBe('Brazil');
  });

  it('clears to the existing product empty string when the picker clears to null', () => {
    expect(
      getCountrySelectCountryName({ countries: COUNTRIES, countryCode: null }),
    ).toBe('');
  });

  it('ignores an identifier absent from the prepared countries', () => {
    expect(
      getCountrySelectCountryName({ countries: COUNTRIES, countryCode: 'ZZ' }),
    ).toBeUndefined();
  });
});
