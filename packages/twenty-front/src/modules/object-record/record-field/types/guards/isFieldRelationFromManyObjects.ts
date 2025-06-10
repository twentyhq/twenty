import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';

import { RelationDefinitionType } from '~/generated-metadata/graphql';
import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldRelationMetadata } from '../FieldMetadata';

export const isFieldRelationFromManyObjects = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>,
): field is FieldDefinition<FieldRelationMetadata> =>
  isFieldRelation(field) &&
  field.metadata.relationType === RelationDefinitionType.ONE_TO_MANY;
