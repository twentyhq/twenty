import { useCallback } from 'react';

import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { isDefined } from 'twenty-shared/utils';

export const useCountryUtils = () => {
  const countries = useCountries();

  const findCountryCodeByCountryName = useCallback(
    (countryName?: string): string => {
      if (!isDefined(countryName) || countryName === '') return '';

      const foundCountry = countries.find(
        (country) => country.countryName === countryName,
      );
      return foundCountry?.countryCode ?? '';
    },
    [countries],
  );

  const findCountryNameByCountryCode = useCallback(
    (countryCode?: string): string | null => {
      if (!isDefined(countryCode) || countryCode === '') return '';

      const foundCountry = countries.find(
        (country) => country.countryCode === countryCode,
      );

      return foundCountry?.countryName ?? null;
    },
    [countries],
  );

  return { findCountryCodeByCountryName, findCountryNameByCountryCode };
};
