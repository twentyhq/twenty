import {
  type FieldPhonesValue,
  type PhoneRecord,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

// Records migrated from older versions can carry additional phones whose
// `callingCode` / `countryCode` are null, or which hold no number at all.
// Those values are not valid `PhoneRecord`s, so they render as empty chips and
// make the whole field value fail validation on save. Coerce what is usable and
// drop what is not, rather than letting a single legacy row break the field.
const toPhoneRecord = (phone: unknown): PhoneRecord | null => {
  if (!isDefined(phone) || typeof phone !== 'object') {
    return null;
  }

  const { number, callingCode, countryCode } = phone as Partial<PhoneRecord>;

  if (!isNonEmptyString(number)) {
    return null;
  }

  return {
    number,
    callingCode: typeof callingCode === 'string' ? callingCode : '',
    countryCode: typeof countryCode === 'string' ? countryCode : '',
  };
};

export const createPhonesFromFieldValue = (fieldValue: FieldPhonesValue) => {
  return !isDefined(fieldValue)
    ? []
    : [
        fieldValue.primaryPhoneNumber
          ? {
              number: fieldValue.primaryPhoneNumber,
              callingCode: fieldValue.primaryPhoneCallingCode
                ? fieldValue.primaryPhoneCallingCode
                : fieldValue.primaryPhoneCountryCode,
              countryCode: fieldValue.primaryPhoneCountryCode,
            }
          : null,
        ...(fieldValue.additionalPhones ?? []).map(toPhoneRecord),
      ].filter(isDefined);
};

// Total by construction: every branch returns strings, so the result always
// satisfies `phonesFieldValueSchema`. Returning `undefined` here used to let
// callers forward it to `persistField`, which threw
// "Invalid value to persist: undefined for type : PHONES".
export const parsePhonesToFieldValue = (
  phones: PhoneRecord[],
): FieldPhonesValue => {
  const [primaryPhone, ...additionalPhones] = (phones ?? [])
    .map(toPhoneRecord)
    .filter(isDefined);

  return {
    primaryPhoneNumber: primaryPhone?.number ?? '',
    primaryPhoneCountryCode: primaryPhone?.countryCode ?? '',
    primaryPhoneCallingCode: primaryPhone?.callingCode ?? '',
    additionalPhones,
  };
};
