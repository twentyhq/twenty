import { getCountrySelectValue } from '@/ui/input/components/internal/country/utils/getCountrySelectValue';
import { type Country } from '@/ui/input/components/internal/types/Country';

const COUNTRIES: Pick<Country, 'countryCode' | 'countryName'>[] = [
  { countryCode: 'FR', countryName: 'France' },
  { countryCode: 'BR', countryName: 'Brazil' },
];

describe('getCountrySelectValue', () => {
  it('selects the stable identifier for an existing stored country name', () => {
    expect(
      getCountrySelectValue({ countries: COUNTRIES, countryName: 'Brazil' }),
    ).toBe('BR');
  });

  it.each(['', null])('treats %p as an empty selection', (countryName) => {
    expect(
      getCountrySelectValue({ countries: COUNTRIES, countryName }),
    ).toBeNull();
  });

  it.each(['Atlantis', 'FR', ' ', 'france'])(
    'keeps legacy stored value %p distinct from an empty or known selection',
    (countryName) => {
      const value = getCountrySelectValue({
        countries: COUNTRIES,
        countryName,
      });

      expect(value).not.toBeNull();
      expect(COUNTRIES.some((country) => country.countryCode === value)).toBe(
        false,
      );
      expect(value).toBe(
        getCountrySelectValue({ countries: COUNTRIES, countryName }),
      );
    },
  );
});
