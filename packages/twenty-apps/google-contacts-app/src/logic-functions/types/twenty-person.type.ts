import { type CountryCode } from 'libphonenumber-js';

export type TwentyLinkInput = {
  primaryLinkLabel: string;
  primaryLinkUrl: string;
  secondaryLinks: null;
};

type TwentyAdditionalPhoneInput = {
  number: string;
  countryCode: CountryCode | '';
  callingCode: string;
};

export type TwentyPhonesInput = {
  primaryPhoneNumber: string;
  primaryPhoneCallingCode: string;
  primaryPhoneCountryCode: CountryCode | '';
  additionalPhones: TwentyAdditionalPhoneInput[];
};

export type TwentyPersonInput = {
  googleContactsId: string;
  name?: {
    firstName: string;
    lastName: string;
  };
  emails?: {
    primaryEmail: string;
    additionalEmails: string[];
  };
  phones?: TwentyPhonesInput;
  jobTitle?: string;
  linkedinLink?: TwentyLinkInput;
  xLink?: TwentyLinkInput;
  avatarUrl?: string;
};
