import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';

import { RelationDefinitionType } from '~/generated-metadata/graphql';
import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldRelationMetadata } from '../FieldMetadata';

export const isFieldRelationToOneObject = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>,
): field is FieldDefinition<FieldRelationMetadata> =>
  isFieldRelation(field) &&
  field.metadata.relationType === RelationDefinitionType.MANY_TO_ONE;
