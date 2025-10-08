import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';

import { RelationType } from '~/generated-metadata/graphql';
import { type FieldDefinition } from '../FieldDefinition';
import {
  type FieldMetadata,
  type FieldRelationMetadata,
} from '../FieldMetadata';

export const isFieldRelationOneToMany = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>,
): field is FieldDefinition<FieldRelationMetadata> =>
  isFieldRelation(field) &&
  field.metadata.relationType === RelationType.ONE_TO_MANY;
