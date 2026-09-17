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
    additionalPhones?:
      { number?: string | null; callingCode?: string | null }[] | null;
  } | null;
  linkedinLink?: { primaryLinkUrl?: string | null } | null;
  company?: { name?: string | null } | null;
};

export type TwentyNameInput = {
  firstName: string;
  lastName: string;
};

export type TwentyEmailsInput = {
  primaryEmail: string | null;
  additionalEmails: string[];
};

export type TwentyPersonInput = {
  googleContactsId: string;
  companyId?: string;
  name: TwentyNameInput;
  emails: TwentyEmailsInput;
  phones: TwentyPhonesInput;
  jobTitle: string;
  linkedinLink: TwentyLinkInput;
  avatarUrl: string;
};

export type ExistingTwentyPerson = {
  id: string;
  googleContactsId?: string | null;
  updatedAt?: string | null;
};

export type PersonToUpsert = TwentyPersonInput & { id?: string };
