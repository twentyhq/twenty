import {
  type FieldPhonesValue,
  type PhoneRecord,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const toPhoneRecord = (phone: {
  number?: string | null;
  callingCode?: string | null;
  countryCode?: string | null;
}): PhoneRecord | undefined => {
  if (!isNonEmptyString(phone.number)) {
    return undefined;
  }

  return {
    number: phone.number,
    callingCode: phone.callingCode ?? '',
    countryCode: phone.countryCode ?? '',
  };
};

export const createPhonesFromFieldValue = (
  fieldValue: FieldPhonesValue,
): PhoneRecord[] => {
  if (!isDefined(fieldValue)) {
    return [];
  }

  return [
    isNonEmptyString(fieldValue.primaryPhoneNumber)
      ? {
          number: fieldValue.primaryPhoneNumber,
          callingCode: isNonEmptyString(fieldValue.primaryPhoneCallingCode)
            ? fieldValue.primaryPhoneCallingCode
            : fieldValue.primaryPhoneCountryCode,
          countryCode: fieldValue.primaryPhoneCountryCode,
        }
      : null,
    ...(fieldValue.additionalPhones ?? []),
  ]
    .filter(isDefined)
    .map(toPhoneRecord)
    .filter(isDefined);
};

// Always returns a persistable value so Escape / click-outside cannot abort
// on `undefined` before the field input closes.
export const parsePhonesToFieldValue = (
  phones: PhoneRecord[],
): FieldPhonesValue => {
  const [primaryPhone, ...additionalPhones] = phones
    .map(toPhoneRecord)
    .filter(isDefined);

  return {
    primaryPhoneNumber: primaryPhone?.number ?? '',
    primaryPhoneCountryCode: primaryPhone?.countryCode ?? '',
    primaryPhoneCallingCode: primaryPhone?.callingCode ?? '',
    additionalPhones,
  };
};
