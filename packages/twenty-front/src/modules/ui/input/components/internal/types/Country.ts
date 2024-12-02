import * as Flags from 'country-flag-icons/react/3x2';
import { CountryCallingCode, CountryCode } from 'libphonenumber-js';

export type Country = {
  countryCode: CountryCode;
  countryName: string;
  callingCode: CountryCallingCode;
  Flag: Flags.FlagComponent;
};
