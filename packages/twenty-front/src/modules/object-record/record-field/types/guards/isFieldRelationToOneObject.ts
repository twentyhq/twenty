import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';

import { RelationDefinitionType } from '~/generated-metadata/graphql';
import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata } from '../FieldMetadata';

export const isFieldRelationToOneObject = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>,
): field is FieldDefinition<FieldMetadata> =>
  isFieldRelation(field) &&
  field.metadata.relationType === RelationDefinitionType.ManyToOne;
