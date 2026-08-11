import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { isSearchableFieldType } from 'twenty-shared/utils';

// UUID passes isSearchableFieldType server-side so that junction objects, whose
// label identifier is the id field, can be indexed. That is never a choice a
// user should make, so it is excluded here along with the id field itself.
export const canBeSearchable = (
  field: Pick<FieldMetadataItem, 'type' | 'name'>,
) =>
  isSearchableFieldType(field.type) &&
  field.type !== FieldMetadataType.UUID &&
  field.name !== 'id';
