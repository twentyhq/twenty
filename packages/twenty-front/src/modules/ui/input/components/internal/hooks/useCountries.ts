import { hasFlag } from 'country-flag-icons';
import * as Flags from 'country-flag-icons/react/3x2';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import { useMemo } from 'react';

import { type Country } from '@/ui/input/components/internal/types/Country';

export const useCountries = () => {
  return useMemo<Country[]>(() => {
    const regionNamesInEnglish = new Intl.DisplayNames(['en'], {
      type: 'region',
    });

    const countryCodes = getCountries();

    return countryCodes.reduce<Country[]>((result, countryCode) => {
      const countryName = regionNamesInEnglish.of(countryCode);

      if (!countryName) return result;

      if (!hasFlag(countryCode)) return result;

      const Flag = Flags[countryCode];

      const callingCode = getCountryCallingCode(countryCode);

      result.push({
        countryCode,
        countryName,
        callingCode,
        Flag,
      });

      return result;
    }, []);
  }, []);
};
