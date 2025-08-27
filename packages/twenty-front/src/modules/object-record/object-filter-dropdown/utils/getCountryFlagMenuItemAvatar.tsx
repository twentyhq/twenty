import { type Country } from '@/ui/input/components/internal/types/Country';

export const getCountryFlagMenuItemAvatar = (
  countryName: string,
  countries: Country[],
): React.ReactNode => {
  const country = countries.find(
    (country) => country.countryName === countryName,
  );

  if (!country) {
    return <div style={{ width: 20 }} />;
  }

  return country.Flag({ width: 20 });
};
