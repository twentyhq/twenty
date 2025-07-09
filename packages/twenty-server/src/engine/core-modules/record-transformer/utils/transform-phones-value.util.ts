import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  CountryCallingCode,
  parsePhoneNumberWithError,
} from 'libphonenumber-js';
import {
  getCountryCodesForCallingCode,
  isDefined,
  isValidCountryCode,
  parseJson,
  removeUndefinedFields,
} from 'twenty-shared/utils';

import {
  RecordTransformerException,
  RecordTransformerExceptionCode,
} from 'src/engine/core-modules/record-transformer/record-transformer.exception';
import {
  AdditionalPhoneMetadata,
  PhonesMetadata,
} from 'src/engine/metadata-modules/field-metadata/composite-types/phones.composite-type';

export type PhonesFieldGraphQLInput =
  | Partial<
      Omit<PhonesMetadata, 'additionalPhones'> & {
        additionalPhones: string | null;
      }
    >
  | null
  | undefined;

type AdditionalPhoneMetadataWithNumber = Partial<AdditionalPhoneMetadata> &
  Required<Pick<AdditionalPhoneMetadata, 'number'>>;

const removePlusFromString = (str: string) => str.replace(/\+/g, '');

const validatePrimaryPhoneCountryCodeAndCallingCode = ({
  callingCode,
  countryCode,
}: Partial<Omit<AdditionalPhoneMetadata, 'number'>>) => {
  if (isNonEmptyString(countryCode) && !isValidCountryCode(countryCode)) {
    throw new RecordTransformerException(
      `Invalid country code ${countryCode}`,
      RecordTransformerExceptionCode.INVALID_PHONE_COUNTRY_CODE,
      t`Invalid country code ${countryCode}`,
    );
  }

  if (!isNonEmptyString(callingCode)) {
    return;
  }

  const expectedCountryCodes = getCountryCodesForCallingCode(callingCode);

  if (expectedCountryCodes.length === 0) {
    throw new RecordTransformerException(
      `Invalid calling code ${callingCode}`,
      RecordTransformerExceptionCode.INVALID_PHONE_CALLING_CODE,
      t`Invalid calling code ${callingCode}`,
    );
  }

  if (
    isNonEmptyString(countryCode) &&
    expectedCountryCodes.every(
      (expectedCountryCode) => expectedCountryCode !== countryCode,
    )
  ) {
    throw new RecordTransformerException(
      `Provided country code and calling code are conflicting`,
      RecordTransformerExceptionCode.CONFLICTING_PHONE_CALLING_CODE_AND_COUNTRY_CODE,
      t`Provided country code and calling code are conflicting`,
    );
  }
};

const parsePhoneNumberExceptionWrapper = ({
  callingCode,
  countryCode,
  number,
}: AdditionalPhoneMetadataWithNumber) => {
  try {
    return parsePhoneNumberWithError(number, {
      defaultCallingCode: callingCode
        ? removePlusFromString(callingCode)
        : callingCode,
      defaultCountry: countryCode,
    });
  } catch (error) {
    throw new RecordTransformerException(
      `Provided phone number is invalid ${number}`,
      RecordTransformerExceptionCode.INVALID_PHONE_NUMBER,
      t`Provided phone number is invalid ${number}`,
    );
  }
};

const validateAndInferMetadataFromPrimaryPhoneNumber = ({
  callingCode,
  countryCode,
  number,
}: AdditionalPhoneMetadataWithNumber): Partial<AdditionalPhoneMetadata> => {
  const phone = parsePhoneNumberExceptionWrapper({
    callingCode,
    countryCode,
    number,
  });

  if (
    isNonEmptyString(phone.country) &&
    isNonEmptyString(countryCode) &&
    phone.country !== countryCode
  ) {
    throw new RecordTransformerException(
      'Provided and inferred country code are conflicting',
      RecordTransformerExceptionCode.CONFLICTING_PHONE_COUNTRY_CODE,
      t`Provided and inferred country code are conflicting`,
    );
  }

  if (
    isNonEmptyString(phone.countryCallingCode) &&
    isNonEmptyString(callingCode) &&
    phone.countryCallingCode !== removePlusFromString(callingCode)
  ) {
    throw new RecordTransformerException(
      'Provided and inferred calling code are conflicting',
      RecordTransformerExceptionCode.CONFLICTING_PHONE_CALLING_CODE,
      t`Provided and inferred calling code are conflicting`,
    );
  }

  const finalPrimaryPhoneCallingCode =
    callingCode ??
    (`+${phone.countryCallingCode}` as undefined | CountryCallingCode);
  const finalPrimaryPhoneCountryCode = countryCode ?? phone.country;

  return {
    countryCode: finalPrimaryPhoneCountryCode,
    callingCode: finalPrimaryPhoneCallingCode,
    number: phone.nationalNumber,
  };
};

const validateAndInferPhoneInput = ({
  callingCode,
  countryCode,
  number,
}: Partial<AdditionalPhoneMetadata>) => {
  validatePrimaryPhoneCountryCodeAndCallingCode({
    callingCode,
    countryCode,
  });

  if (isDefined(number) && isNonEmptyString(number)) {
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
