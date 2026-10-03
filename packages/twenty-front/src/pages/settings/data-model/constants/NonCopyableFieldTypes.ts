import { type FieldType } from '@/settings/data-model/types/FieldType';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { NEW_FIELD_EXCLUDED_FIELD_TYPES } from '~/pages/settings/data-model/constants/NewFieldExcludedFieldTypes';

// Relations also create a field on the target object, so a copy needs its own relation setup
export const NON_COPYABLE_FIELD_TYPES: FieldType[] = [
  ...NEW_FIELD_EXCLUDED_FIELD_TYPES,
  FieldMetadataType.RELATION,
  FieldMetadataType.MORPH_RELATION,
];
