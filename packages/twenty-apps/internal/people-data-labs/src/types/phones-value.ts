export type AdditionalPhone = {
  number: string;
  countryCode: string;
  callingCode: string;
};

export type PhonesValue = {
  primaryPhoneNumber: string;
  primaryPhoneCountryCode: string;
  primaryPhoneCallingCode: string;
  additionalPhones: AdditionalPhone[] | null;
};
