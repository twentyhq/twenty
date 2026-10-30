import { isNull } from '@sniptt/guards';

import { type Country } from '@/ui/input/components/internal/types/Country';

export const getCountrySelectCountryName = ({
  countries,
  countryCode,
}: {
  countries: readonly Pick<Country, 'countryCode' | 'countryName'>[];
  countryCode: string | null;
}): string | undefined => {
  if (isNull(countryCode)) {
    return '';
  }

  return countries.find((country) => country.countryCode === countryCode)
    ?.countryName;
};
