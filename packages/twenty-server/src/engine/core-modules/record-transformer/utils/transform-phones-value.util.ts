import { isDefined, parseJson } from 'twenty-shared/utils';

import {
  CountryCallingCode,
  CountryCode,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumber,
} from 'libphonenumber-js';
import { PhonesMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/phones.composite-type';

const ALL_COUNTRIES_CODE = getCountries();

export type LinksFieldGraphQLInput =
  | Partial<
      Omit<PhonesMetadata, 'additionalPhones'> & { additionalPhones: string }
    >
  | null
  | undefined;
type DefinedLinksFieldGraphQLInput = NonNullable<LinksFieldGraphQLInput>;
type LinksFieldGraphQLInputWithPrimaryPhoneNumber =
  DefinedLinksFieldGraphQLInput &
    Required<Pick<DefinedLinksFieldGraphQLInput, 'primaryPhoneNumber'>>;

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
  primaryPhoneCallingCode,
  primaryPhoneCountryCode,
}: Omit<
  DefinedLinksFieldGraphQLInput,
  'primaryPhoneNumber' | 'additionalPhones'
>) => {
  if (
    isDefined(primaryPhoneCountryCode) &&
    !isValidCountryCode(primaryPhoneCountryCode)
  ) {
    throw new Error('TOOD invalid country code');
  }

  if (!isDefined(primaryPhoneCallingCode)) {
    return;
  }

  const expectedCountryCodes = getCountryCodesForCallingCode(
    primaryPhoneCallingCode,
  );
  if (expectedCountryCodes.length === 0) {
    throw new Error('TODO invalid country calling code');
  }

  if (
    isDefined(primaryPhoneCountryCode) &&
    expectedCountryCodes.every(
      (expectedCountryCode) => expectedCountryCode !== primaryPhoneCountryCode,
    )
  ) {
    throw new Error('TODO conflicting country code and calling code');
  }
};

const validateAndInferMetadataFromPrimaryPhoneNumber = ({
  primaryPhoneNumber,
  primaryPhoneCountryCode,
  primaryPhoneCallingCode,
}: Omit<LinksFieldGraphQLInputWithPrimaryPhoneNumber, 'additionalPhones'>) => {
  try {
    const phone = parsePhoneNumber(primaryPhoneNumber);

    if (
      isDefined(phone.country) &&
      isDefined(primaryPhoneCountryCode) &&
      phone.country !== primaryPhoneCountryCode
    ) {
      throw new Error('TODO conflicting primaryPhoneCountryCode');
    }

    if (
      isDefined(phone.countryCallingCode) &&
      isDefined(primaryPhoneCallingCode) &&
      phone.countryCallingCode !== primaryPhoneCallingCode
    ) {
      throw new Error('TODO conficting primaryPhoneCallingCode');
    }

    const finalPrimaryPhoneCallingCode =
      (phone.countryCallingCode as undefined | CountryCallingCode) ??
      primaryPhoneCallingCode;
    const finalPrimaryPhoneCountryCode =
      phone.country ?? primaryPhoneCountryCode;

    return {
      primaryPhoneCallingCode: finalPrimaryPhoneCountryCode,
      primaryPhoneCountryCode: finalPrimaryPhoneCallingCode,
      primaryPhoneNumber: phone.nationalNumber,
    };
  } catch (e) {
    throw new Error('TODO invalid number format');
  }
};

// TODO factorize types ?
const validateAndInferPhoneInput = ({
  primaryPhoneCallingCode,
  primaryPhoneCountryCode,
  primaryPhoneNumber,
}: Omit<DefinedLinksFieldGraphQLInput, 'additionalPhones'>) => {
  validatePrimaryPhoneCountryCodeAndCallingCode({
    primaryPhoneCallingCode,
    primaryPhoneCountryCode,
  });

  // Should we swallow only in case that's not a valid phonenumnber :thinking:
  if (isDefined(primaryPhoneNumber) && primaryPhoneNumber.startsWith('+')) {
    return validateAndInferMetadataFromPrimaryPhoneNumber({
      primaryPhoneNumber,
      primaryPhoneCallingCode,
      primaryPhoneCountryCode,
    });
  }

  return {
    primaryPhoneCallingCode,
    primaryPhoneCountryCode,
    primaryPhoneNumber,
  };
};

type TransformPhonesValueArgs = {
  input: LinksFieldGraphQLInput;
};
export const transformPhonesValue = ({
  input,
}: TransformPhonesValueArgs): LinksFieldGraphQLInput => {
  console.log('*'.repeat(100));
  console.log(input);
  console.log('*'.repeat(100));

  if (!isDefined(input)) {
    return input;
  }

  const { additionalPhones, ...primary } = input;
  const parsedAdditionalPhones = isDefined(additionalPhones)
    ? parseJson<Omit<DefinedLinksFieldGraphQLInput, 'additionalPhones'>[]>(
        additionalPhones,
      )
    : undefined;
  const {
    primaryPhoneCallingCode,
    primaryPhoneCountryCode,
    primaryPhoneNumber,
  } = validateAndInferPhoneInput(primary);

  return {
    additionalPhones: JSON.stringify(
      (parsedAdditionalPhones ?? []).map(validateAndInferPhoneInput),
    ),
    primaryPhoneCallingCode,
    primaryPhoneCountryCode,
    primaryPhoneNumber,
  };
};
