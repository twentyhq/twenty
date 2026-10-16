import { t } from '@lingui/core/macro';

const MAX_COUNTRY_NAMES_TO_DISPLAY = 5;

export const getCountryFilterDisplayValue = (countryNames: string[]) => {
  const countryCount = countryNames.length;

  return countryCount > MAX_COUNTRY_NAMES_TO_DISPLAY
    ? t`${countryCount} countries`
    : countryNames.join(', ');
};
