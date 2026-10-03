import { type FieldType } from '@/settings/data-model/types/FieldType';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const NEW_FIELD_EXCLUDED_FIELD_TYPES: FieldType[] = [
  FieldMetadataType.NUMERIC,
  FieldMetadataType.ACTOR,
  FieldMetadataType.UUID,
];
