import {
  type FieldPhonesValue,
  type PhoneRecord,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

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
    .map((phone) => {
      if (!isNonEmptyString(phone.number)) {
        return undefined;
      }

      return {
        number: phone.number,
        callingCode: phone.callingCode ?? '',
        countryCode: phone.countryCode ?? '',
      };
    })
    .filter(isDefined);
};
