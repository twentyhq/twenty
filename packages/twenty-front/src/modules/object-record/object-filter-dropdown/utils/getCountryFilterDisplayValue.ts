import { t } from '@lingui/core/macro';

const MAX_COUNTRY_NAMES_TO_DISPLAY = 5;

export const getCountryFilterDisplayValue = (countryNames: string[]) => {
  const countriesLabel = t`countries`;

  return countryNames.length > MAX_COUNTRY_NAMES_TO_DISPLAY
    ? `${countryNames.length} ${countriesLabel}`
    : countryNames.join(', ');
};
