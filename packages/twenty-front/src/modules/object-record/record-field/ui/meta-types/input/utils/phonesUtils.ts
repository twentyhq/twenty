import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { normalizeAdditionalPhones } from '@/object-record/record-field/ui/utils/normalizeAdditionalPhones';
import { isDefined } from 'twenty-shared/utils';

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
        ...normalizeAdditionalPhones(fieldValue.additionalPhones),
      ].filter(isDefined);
};
