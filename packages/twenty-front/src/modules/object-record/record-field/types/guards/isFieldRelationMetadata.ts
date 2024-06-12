import {
  FieldMetadata,
  FieldRelationMetadata,
} from '@/object-record/record-field/types/FieldMetadata';

export const isFieldRelationMetadata = (
  metadata: FieldMetadata,
): metadata is FieldRelationMetadata => {
  return (metadata as FieldRelationMetadata).relationType !== undefined;
};
