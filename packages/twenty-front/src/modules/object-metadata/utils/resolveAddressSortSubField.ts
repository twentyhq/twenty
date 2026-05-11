import { ADDRESS_DEFAULT_SORT_SUB_FIELD } from '@/object-metadata/constants/AddressDefaultSortSubField';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getEnabledAddressSubFields } from '@/object-metadata/utils/getEnabledAddressSubFields';
import {
  ALLOWED_ADDRESS_SUBFIELDS,
  type AllowedAddressSubField,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const isAllowedAddressSubField = (
  value: string | null | undefined,
): value is AllowedAddressSubField =>
  ALLOWED_ADDRESS_SUBFIELDS.includes(value as AllowedAddressSubField);

export const resolveAddressSortSubField = (
  settings: FieldMetadataItem['settings'] | null | undefined,
  requestedSubField?: string | null,
): AllowedAddressSubField => {
  const enabledSubFields = getEnabledAddressSubFields(settings);

  if (
    isDefined(requestedSubField) &&
    isAllowedAddressSubField(requestedSubField) &&
    enabledSubFields.includes(requestedSubField)
  ) {
    return requestedSubField;
  }

  if (enabledSubFields.includes(ADDRESS_DEFAULT_SORT_SUB_FIELD)) {
    return ADDRESS_DEFAULT_SORT_SUB_FIELD;
  }

  return enabledSubFields[0] ?? ADDRESS_DEFAULT_SORT_SUB_FIELD;
};
