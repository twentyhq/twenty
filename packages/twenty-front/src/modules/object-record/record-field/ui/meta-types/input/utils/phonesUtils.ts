import {
  type FieldPhonesValue,
  type PhoneRecord,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const createPhoneFromAdditionalPhone = (
  additionalPhone: Partial<PhoneRecord> | null | undefined,
): PhoneRecord | null => {
  if (
    !isDefined(additionalPhone) ||
    !isNonEmptyString(additionalPhone.number)
  ) {
    return null;
  }

  return {
    number: additionalPhone.number,
    callingCode: additionalPhone.callingCode ?? '',
    countryCode: additionalPhone.countryCode ?? '',
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
        ...(fieldValue.additionalPhones ?? []).map(
          createPhoneFromAdditionalPhone,
        ),
      ].filter(isDefined);
};
