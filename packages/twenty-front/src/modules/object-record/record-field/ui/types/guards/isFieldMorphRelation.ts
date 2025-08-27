import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMetadata,
  type FieldMorphRelationMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const isFieldMorphRelation = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldMorphRelationMetadata> =>
  field.type === FieldMetadataType.MORPH_RELATION;
