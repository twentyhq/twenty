import { FieldAddressValue } from '@/object-record/record-field/types/FieldMetadata';
import { isNonEmptyString } from '@sniptt/guards';
import {
  ALLOWED_ADDRESS_SUBFIELDS,
  AllowedAddressSubField,
} from 'twenty-shared/src/types/AddressFieldsType';
import { isDefined } from 'twenty-shared/utils';

export const extractSubFieldsAddressValues = (
  fieldValue: FieldAddressValue | undefined,
  subFields: AllowedAddressSubField[] | null | undefined,
) => {
  if (!isDefined(fieldValue)) return '';
  const fieldsToUse =
    subFields && subFields.length > 0
      ? subFields
      : [...ALLOWED_ADDRESS_SUBFIELDS];

  return formatSubFieldsAddressValues(fieldValue, fieldsToUse);
};

const formatSubFieldsAddressValues = (
  fieldValue: FieldAddressValue,
  subFields: AllowedAddressSubField[],
) => {
  return subFields
    .map((subField) => fieldValue[subField])
    .filter(isNonEmptyString)
    .join(',');
};
