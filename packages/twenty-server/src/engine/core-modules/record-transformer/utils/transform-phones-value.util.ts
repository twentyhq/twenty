import {
  isDefined,
  parseJson,
  removeUndefinedFields,
} from 'twenty-shared/utils';

import { isNonEmptyString } from '@sniptt/guards';
import {
  CountryCallingCode,
  CountryCode,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberWithError
} from 'libphonenumber-js';
import {
  AdditionalPhoneMetadata,
  PhonesMetadata,
} from 'src/engine/metadata-modules/field-metadata/composite-types/phones.composite-type';

const ALL_COUNTRIES_CODE = getCountries();

export type PhonesFieldGraphQLInput =
  | Partial<
      Omit<PhonesMetadata, 'additionalPhones'> & {
        additionalPhones: string | null;
      }
    >
  | null
  | undefined;
type PhoneMetadataWithNumber = Partial<AdditionalPhoneMetadata> &
  Required<Pick<AdditionalPhoneMetadata, 'number'>>;

const isValidCountryCode = (input: string): input is CountryCode => {
  return ALL_COUNTRIES_CODE.includes(input as unknown as CountryCode);
};

const getCountryCodesForCallingCode = (callingCode: string) => {
  const cleanCallingCode = callingCode.startsWith('+')
    ? callingCode.slice(1)
    : callingCode;

  return ALL_COUNTRIES_CODE.filter((country) => {
    const countryCallingCode = getCountryCallingCode(country);
    return countryCallingCode === cleanCallingCode;
  });
};

const validatePrimaryPhoneCountryCodeAndCallingCode = ({
  callingCode,
  countryCode,
}: Partial<Omit<AdditionalPhoneMetadata, 'number'>>) => {
  if (isNonEmptyString(countryCode) && !isValidCountryCode(countryCode)) {
    throw new Error('TOOD invalid country code');
  }

  if (!isNonEmptyString(callingCode)) {
    return;
  }

  const expectedCountryCodes = getCountryCodesForCallingCode(callingCode);
  if (expectedCountryCodes.length === 0) {
    throw new Error('TODO invalid country calling code');
  }

  if (
    isNonEmptyString(countryCode) &&
    expectedCountryCodes.every(
      (expectedCountryCode) => expectedCountryCode !== countryCode,
    )
  ) {
    throw new Error('TODO conflicting country code and calling code');
  }
};

const parsePhoneNumberExceptionWrapper = (phoneNumber: string) => {
  try {
    const phone = parsePhoneNumberWithError(phoneNumber);
    console.log(phone)
    if (!phone.isValid() && !phone.isPossible()) {
      throw new Error("TODO invalid phone number A")
    }

    return phone
  } catch (error) {
    throw new Error('TODO invalid phone number');
  }
};

const validateAndInferMetadataFromPrimaryPhoneNumber = ({
  callingCode,
  countryCode,
  number,
}: PhoneMetadataWithNumber): Partial<AdditionalPhoneMetadata> => {
  const phone = parsePhoneNumberExceptionWrapper(number);

  if (
    isNonEmptyString(phone.country) &&
    isNonEmptyString(countryCode) &&
    phone.country !== countryCode
  ) {
    throw new Error('TODO conflicting countryCode');
  }

  if (
    isNonEmptyString(phone.countryCallingCode) &&
    isNonEmptyString(callingCode) &&
    phone.countryCallingCode !== callingCode.replace(/\+/g, '')
  ) {
    throw new Error('TODO conficting callingCode');
  }

  const finalPrimaryPhoneCallingCode =
    callingCode ?? (`+${phone.countryCallingCode}` as undefined | CountryCallingCode);
  const finalPrimaryPhoneCountryCode = countryCode ?? phone.country;

  return {
    countryCode: finalPrimaryPhoneCountryCode,
    callingCode: finalPrimaryPhoneCallingCode,
    number: phone.nationalNumber,
  };
};

// TODO factorize types ?
const validateAndInferPhoneInput = ({
  callingCode,
  countryCode,
  number,
}: Partial<AdditionalPhoneMetadata>) => {
  validatePrimaryPhoneCountryCodeAndCallingCode({
    callingCode,
    countryCode,
  });

  // Should we swallow only in case that's not a valid phone numnber :thinking:
  if (isDefined(number) && number.startsWith('+')) {
    return validateAndInferMetadataFromPrimaryPhoneNumber({
      number,
      callingCode,
      countryCode,
    });
  }

  return {
    callingCode,
    countryCode,
    number,
  };
};

type TransformPhonesValueArgs = {
  input: PhonesFieldGraphQLInput;
};
export const transformPhonesValue = ({
  input,
}: TransformPhonesValueArgs): PhonesFieldGraphQLInput => {

  if (!isDefined(input)) {
    return input;
  }

  const { additionalPhones, ...primary } = input;

  const {
    callingCode: primaryPhoneCallingCode,
    countryCode: primaryPhoneCountryCode,
    number: primaryPhoneNumber,
  } = validateAndInferPhoneInput({
    callingCode: primary.primaryPhoneCallingCode,
    countryCode: primary.primaryPhoneCountryCode,
    number: primary.primaryPhoneNumber,
  });

  const parsedAdditionalPhones = isDefined(additionalPhones)
    ? parseJson<AdditionalPhoneMetadata[]>(additionalPhones)
    : additionalPhones;
  const transformedAdditionalPhones = isDefined(parsedAdditionalPhones)
    ? JSON.stringify(parsedAdditionalPhones.map(validateAndInferPhoneInput))
    : parsedAdditionalPhones;

  return removeUndefinedFields({
    additionalPhones: transformedAdditionalPhones,
    primaryPhoneCallingCode,
    primaryPhoneCountryCode,
    primaryPhoneNumber,
  });
};
