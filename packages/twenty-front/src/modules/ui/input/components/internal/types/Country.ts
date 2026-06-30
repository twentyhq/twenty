import type { FlagComponent } from 'country-flag-icons/react/3x2';
import type { CountryCallingCode, CountryCode } from 'libphonenumber-js';

export type Country = {
  countryCode: CountryCode;
  countryName: string;
  callingCode: CountryCallingCode;
  Flag: FlagComponent;
};
