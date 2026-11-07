import { isNonEmptyString } from '@sniptt/guards';

const getCountryName = ({
  countryCode,
  locale,
}: {
  countryCode: string;
  locale: string;
}): string => {
  try {
    return (
      new Intl.DisplayNames([locale], { type: 'region' }).of(countryCode) ??
      countryCode
    );
  } catch {
    return countryCode;
  }
};

export const formatSessionLocation = ({
  city,
  region,
  country,
  locale,
}: {
  city?: string | null;
  region?: string | null;
  country?: string | null;
  locale: string;
}): string | undefined => {
  const place = isNonEmptyString(city) ? city : region;
  const countryName = isNonEmptyString(country)
    ? getCountryName({ countryCode: country, locale })
    : undefined;

  const location = [place, countryName].filter(isNonEmptyString).join(', ');

  return isNonEmptyString(location) ? location : undefined;
};
