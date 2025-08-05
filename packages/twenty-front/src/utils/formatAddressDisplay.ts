import { FieldAddressValue } from '@/object-record/record-field/types/FieldMetadata';
import {
  ALLOWED_ADDRESS_SUBFIELDS,
  AllowedAddressSubField,
} from 'twenty-shared/src/types/AddressFieldsType';
import { isDefined } from 'twenty-shared/utils';
import { joinAddressFieldValues } from '~/utils/joinAddressFieldValues';

export const formatAddressDisplay = (
  fieldValue: FieldAddressValue | undefined,
  subFields: AllowedAddressSubField[] | null | undefined,
) => {
  if (!isDefined(fieldValue)) return '';
  const fieldsToUse =
    subFields && subFields.length > 0
      ? subFields
      : [...ALLOWED_ADDRESS_SUBFIELDS];

  return joinAddressFieldValues(fieldValue, fieldsToUse);
};
