import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getEnabledAddressSubFields } from '@/object-metadata/utils/getEnabledAddressSubFields';
import {
  type AllowedAddressSubField,
  type FieldMetadataSettingsMapping,
  type FieldMetadataType,
} from 'twenty-shared/types';

export const ADDRESS_DEFAULT_SORT_SUB_FIELD: AllowedAddressSubField =
  'addressCity';

type AddressSettings = FieldMetadataSettingsMapping[FieldMetadataType.ADDRESS];

export const getDefaultSortSubFieldForAddress = (
  settings: FieldMetadataItem['settings'] | null | undefined,
): AllowedAddressSubField => {
  const addressSettings = settings as AddressSettings | null | undefined;
  const enabledSubFields = getEnabledAddressSubFields(settings);

  const configuredSubField = addressSettings?.defaultSortSubField;
  if (configuredSubField && enabledSubFields.includes(configuredSubField)) {
    return configuredSubField;
  }

  if (enabledSubFields.includes(ADDRESS_DEFAULT_SORT_SUB_FIELD)) {
    return ADDRESS_DEFAULT_SORT_SUB_FIELD;
  }

  return enabledSubFields[0] ?? ADDRESS_DEFAULT_SORT_SUB_FIELD;
};
