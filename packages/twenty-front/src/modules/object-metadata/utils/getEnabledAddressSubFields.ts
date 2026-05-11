import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { DEFAULT_VISIBLE_ADDRESS_SUBFIELDS } from 'twenty-shared/constants';
import {
  type AllowedAddressSubField,
  type FieldMetadataSettingsMapping,
  type FieldMetadataType,
} from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

type AddressSettings = FieldMetadataSettingsMapping[FieldMetadataType.ADDRESS];

export const getEnabledAddressSubFields = (
  settings: FieldMetadataItem['settings'] | null | undefined,
): readonly AllowedAddressSubField[] => {
  const addressSettings = settings as AddressSettings | null | undefined;
  if (isNonEmptyArray(addressSettings?.subFields)) {
    return addressSettings.subFields;
  }
  return DEFAULT_VISIBLE_ADDRESS_SUBFIELDS;
};
