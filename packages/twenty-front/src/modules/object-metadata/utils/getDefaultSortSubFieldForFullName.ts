import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  type AllowedFullNameSubField,
  type FieldMetadataSettingsMapping,
  type FieldMetadataType,
} from 'twenty-shared/types';

export const FULL_NAME_DEFAULT_SORT_SUB_FIELD: AllowedFullNameSubField =
  'firstName';

type FullNameSettings =
  FieldMetadataSettingsMapping[FieldMetadataType.FULL_NAME];

export const getDefaultSortSubFieldForFullName = (
  settings: FieldMetadataItem['settings'] | null | undefined,
): AllowedFullNameSubField => {
  const fullNameSettings = settings as FullNameSettings | null | undefined;
  return (
    fullNameSettings?.defaultSortSubField ?? FULL_NAME_DEFAULT_SORT_SUB_FIELD
  );
};
