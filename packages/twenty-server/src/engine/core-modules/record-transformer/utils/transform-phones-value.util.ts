import { msg } from '@lingui/core/macro';
import { isArray, isNonEmptyString } from '@sniptt/guards';
import {
  type CountryCallingCode,
  parsePhoneNumberWithError,
} from 'libphonenumber-js';
import isEmpty from 'lodash.isempty';
import { type AdditionalPhoneMetadata } from 'twenty-shared/types';
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

// GraphQL delivers sub-fields as raw strings (or null) at the input boundary.
// The CountryCode brand is applied later, inside validation. Typing the input
// as `CountryCode` here would be a type-level lie — the UI can send '' or any
// string, which is exactly how issue #19740 slipped through.
// additionalPhones accepts both a JSON string and a pre-parsed array; the
// isArray branch below is exercised by several integration suites.
export type PhonesFieldGraphQLInput =
  | {
      primaryPhoneNumber?: string | null;
      primaryPhoneCountryCode?: string | null;
      primaryPhoneCallingCode?: string | null;
      additionalPhones?: string | Partial<AdditionalPhoneMetadata>[] | null;
    }
  | null
  | undefined;

type RawPhoneInput = {
  callingCode?: string | null;
  countryCode?: string | null;
  number?: string | null;
};

type AdditionalPhoneMetadataWithNumber = Partial<AdditionalPhoneMetadata> &
  Required<Pick<AdditionalPhoneMetadata, 'number'>>;

// Unique indexes on composite phone sub-columns treat '' as duplicates but
// NULLs as distinct, so blank inputs must reach the DB as NULL, not ''.
// `undefined` is preserved so partial updates leave unrelated columns untouched.
const nullIfEmptyString = <T extends string>(
  value: T | null | undefined,
): T | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null || value.length === 0) return null;

  return value;
};

const removePlusFromString = (str: string) => str.replace(/\+/g, '');

const validatePrimaryPhoneCountryCodeAndCallingCode = ({
  callingCode,
  countryCode,
}: Omit<RawPhoneInput, 'number'>) => {
  if (isNonEmptyString(countryCode) && !isValidCountryCode(countryCode)) {
    throw new RecordTransformerException(
      `Invalid country code ${countryCode}`,
      RecordTransformerExceptionCode.INVALID_PHONE_COUNTRY_CODE,
      { userFriendlyMessage: msg`Invalid country code ${countryCode}` },
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
      { userFriendlyMessage: msg`Invalid calling code ${callingCode}` },
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
      {
        userFriendlyMessage: msg`Provided country code and calling code are conflicting`,
      },
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
  } catch {
    throw new RecordTransformerException(
      `Provided phone number is invalid ${number}`,
      RecordTransformerExceptionCode.INVALID_PHONE_NUMBER,
      { userFriendlyMessage: msg`Provided phone number is invalid ${number}` },
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
      {
        userFriendlyMessage: msg`Provided and inferred country code are conflicting`,
      },
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
      {
        userFriendlyMessage: msg`Provided and inferred calling code are conflicting`,
      },
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
}: RawPhoneInput) => {
  validatePrimaryPhoneCountryCodeAndCallingCode({
    callingCode,
    countryCode,
  });

  if (isDefined(number) && isNonEmptyString(number)) {
    // validatePrimaryPhoneCountryCodeAndCallingCode already threw on invalid
    // countryCode; this narrow re-runs the guard purely to carry the brand
    // into validateAndInferMetadataFromPrimaryPhoneNumber.
    const brandedCountryCode =
      isNonEmptyString(countryCode) && isValidCountryCode(countryCode)
        ? countryCode
        : undefined;

    // An empty callingCode must be treated as "not provided" so the nullish
    // coalesce below falls through to the inferred `+countryCallingCode`;
    // otherwise '' would survive all the way to primaryPhoneCallingCode.
    const providedCallingCode = isNonEmptyString(callingCode)
      ? callingCode
      : undefined;

    return validateAndInferMetadataFromPrimaryPhoneNumber({
      number,
      callingCode: providedCallingCode,
      countryCode: brandedCountryCode,
    });
  }

  return {
    callingCode: nullIfEmptyString(callingCode),
    countryCode: nullIfEmptyString(countryCode),
    number: nullIfEmptyString(number),
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

  const parsedAdditionalPhones = isNonEmptyString(additionalPhones)
    ? (parseJson<Partial<AdditionalPhoneMetadata>[]>(additionalPhones) ?? [])
    : isArray(additionalPhones)
      ? additionalPhones
      : [];

  const validatedAdditionalPhones = parsedAdditionalPhones.map(
    validateAndInferPhoneInput,
  );

  return removeUndefinedFields({
    additionalPhones: isEmpty(validatedAdditionalPhones)
      ? null
      : JSON.stringify(validatedAdditionalPhones),
    primaryPhoneCallingCode,
    primaryPhoneCountryCode,
    primaryPhoneNumber,
  });
};
