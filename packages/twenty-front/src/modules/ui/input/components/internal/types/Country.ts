import * as Flags from 'country-flag-icons/react/3x2';
import { CountryCallingCode } from 'libphonenumber-js';

export type Country = {
  countryCode: string;
  countryName: string;
  callingCode: CountryCallingCode;
  Flag: Flags.FlagComponent;
};
