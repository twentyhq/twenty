import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { RelationType } from '~/generated-metadata/graphql';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMetadata,
  type FieldMorphRelationMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';

export const isFieldMorphRelationOneToMany = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>,
): field is FieldDefinition<FieldMorphRelationMetadata> =>
  isFieldMorphRelation(field) &&
  field.metadata.relationType === RelationType.ONE_TO_MANY;
