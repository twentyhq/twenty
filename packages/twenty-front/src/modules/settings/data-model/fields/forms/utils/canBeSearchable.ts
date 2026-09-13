import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { isSearchableFieldType } from 'twenty-shared/utils';

export const canBeSearchable = (
  field: Pick<FieldMetadataItem, 'type' | 'name'>,
) =>
  isSearchableFieldType(field.type) &&
  field.type !== FieldMetadataType.UUID &&
  field.name !== 'id';
