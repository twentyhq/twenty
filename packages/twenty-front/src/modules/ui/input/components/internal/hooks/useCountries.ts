import { hasFlag } from 'country-flag-icons';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import { useEffect, useMemo, useState } from 'react';

import { Country } from '@/ui/input/components/internal/types/Country';

export const useCountries = () => {
  const [flags, setFlags] = useState<any>(null);

  useEffect(() => {
    const loadFlags = async () => {
      const flagsModule = await import('country-flag-icons/react/3x2');
      setFlags(flagsModule);
    };

    loadFlags();
  }, []);

  return useMemo<Country[]>(() => {
    const regionNamesInEnglish = new Intl.DisplayNames(['en'], {
      type: 'region',
    });

    const countryCodes = getCountries();

    return countryCodes.reduce<Country[]>((result, countryCode) => {
      const countryName = regionNamesInEnglish.of(countryCode);

      if (!countryName) return result;

      if (!hasFlag(countryCode)) return result;

      const Flag = flags[countryCode];

      const callingCode = getCountryCallingCode(countryCode);

      result.push({
        countryCode,
        countryName,
        callingCode,
        Flag,
      });

      return result;
    }, []);
  }, [flags]);
};
