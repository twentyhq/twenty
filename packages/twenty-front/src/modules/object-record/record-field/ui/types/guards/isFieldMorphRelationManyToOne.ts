import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { RelationType } from '~/generated-metadata/graphql';
import { type FieldDefinition } from '../FieldDefinition';
import {
  type FieldMetadata,
  type FieldMorphRelationMetadata,
} from '../FieldMetadata';

export const isFieldMorphRelationManyToOne = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>,
): field is FieldDefinition<FieldMorphRelationMetadata> =>
  isFieldMorphRelation(field) &&
  field.metadata.relationType === RelationType.MANY_TO_ONE;
