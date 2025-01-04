import { FieldPhonesValue } from '@/object-record/record-field/types/FieldMetadata';
import { isDefined } from 'twenty-ui';

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
        ...(fieldValue.additionalPhones ?? []),
      ].filter(isDefined);
};
