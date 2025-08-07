import { FieldAddressValue } from '@/object-record/record-field/types/FieldMetadata';
import { isNonEmptyString } from '@sniptt/guards';
import { AllowedAddressSubField } from 'twenty-shared/types';

export const joinAddressFieldValues = (
  fieldValue: FieldAddressValue,
  subFields: AllowedAddressSubField[],
) => {
  return subFields
    .map((subField) => fieldValue[subField])
    .filter(isNonEmptyString)
    .join(',');
};
