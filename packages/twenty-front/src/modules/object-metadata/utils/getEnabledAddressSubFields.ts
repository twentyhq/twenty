import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  DEFAULT_VISIBLE_ADDRESS_SUBFIELDS,
  type AllowedAddressSubField,
  type FieldMetadataSettingsMapping,
  type FieldMetadataType,
} from 'twenty-shared/types';

type AddressSettings = FieldMetadataSettingsMapping[FieldMetadataType.ADDRESS];

export const getEnabledAddressSubFields = (
  settings: FieldMetadataItem['settings'] | null | undefined,
): readonly AllowedAddressSubField[] => {
  const addressSettings = settings as AddressSettings | null | undefined;
  if (addressSettings?.subFields && addressSettings.subFields.length > 0) {
    return addressSettings.subFields;
  }
  return DEFAULT_VISIBLE_ADDRESS_SUBFIELDS;
};
