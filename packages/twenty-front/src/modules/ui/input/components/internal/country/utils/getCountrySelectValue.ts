import { isNonEmptyString } from '@sniptt/guards';

import { type Country } from '@/ui/input/components/internal/types/Country';

const UNKNOWN_COUNTRY_VALUE_PREFIX = 'unknown-country:';

export const getCountrySelectValue = ({
  countries,
  countryName,
}: {
  countries: readonly Pick<Country, 'countryCode' | 'countryName'>[];
  countryName: string | null;
}): string | null => {
  if (!isNonEmptyString(countryName)) {
    return null;
  }

  const country = countries.find(
    (availableCountry) => availableCountry.countryName === countryName,
  );

  return (
    country?.countryCode ?? `${UNKNOWN_COUNTRY_VALUE_PREFIX}${countryName}`
  );
};
