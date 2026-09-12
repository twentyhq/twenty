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

// What the Core API returns for an exportable person. Every leaf is nullable
// because the generated core client is untyped and unset composites come back
// as null rather than missing.
export type TwentyPersonRecord = {
  id: string;
  googleContactsId?: string | null;
  jobTitle?: string | null;
  name?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  emails?: {
    primaryEmail?: string | null;
    additionalEmails?: string[] | null;
  } | null;
  phones?: {
    primaryPhoneNumber?: string | null;
    primaryPhoneCallingCode?: string | null;
    additionalPhones?: Partial<TwentyAdditionalPhoneInput>[] | null;
  } | null;
  linkedinLink?: { primaryLinkUrl?: string | null } | null;
  xLink?: { primaryLinkUrl?: string | null } | null;
  company?: { name?: string | null } | null;
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
