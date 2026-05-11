import { ADDRESS_DEFAULT_SORT_SUB_FIELD } from '@/object-metadata/constants/AddressDefaultSortSubField';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getEnabledAddressSubFields } from '@/object-metadata/utils/getEnabledAddressSubFields';
import { type AllowedAddressSubField } from 'twenty-shared/types';

export const getDefaultSortSubFieldForAddress = (
  settings: FieldMetadataItem['settings'] | null | undefined,
): AllowedAddressSubField => {
  const enabledSubFields = getEnabledAddressSubFields(settings);

  if (enabledSubFields.includes(ADDRESS_DEFAULT_SORT_SUB_FIELD)) {
    return ADDRESS_DEFAULT_SORT_SUB_FIELD;
  }

  return enabledSubFields[0] ?? ADDRESS_DEFAULT_SORT_SUB_FIELD;
};
