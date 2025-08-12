import { isFieldMorphRelation } from '@/object-record/record-field/types/guards/isFieldMorphRelation';
import { RelationType } from '~/generated-metadata/graphql';
import { type FieldDefinition } from '../FieldDefinition';
import {
  type FieldMetadata,
  type FieldMorphRelationMetadata,
} from '../FieldMetadata';

export const isFieldMorphRelationOneToManyObjects = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>,
): field is FieldDefinition<FieldMorphRelationMetadata> =>
  isFieldMorphRelation(field) &&
  field.metadata.morphRelations?.[0].type === RelationType.ONE_TO_MANY;
