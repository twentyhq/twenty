import { isFieldMorphRelation } from '@/object-record/record-field/types/guards/isFieldMorphRelation';
import { RelationType } from '~/generated-metadata/graphql';
import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldMorphRelationMetadata } from '../FieldMetadata';

export const isFieldMorphRelationToOneObject = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>,
): field is FieldDefinition<FieldMorphRelationMetadata> =>
  isFieldMorphRelation(field) &&
  field.metadata?.relationType === RelationType.MANY_TO_ONE;
