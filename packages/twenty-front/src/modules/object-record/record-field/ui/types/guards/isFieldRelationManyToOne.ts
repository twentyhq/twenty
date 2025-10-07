import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';

import { RelationType } from '~/generated-metadata/graphql';
import { type FieldDefinition } from '../FieldDefinition';
import {
  type FieldMetadata,
  type FieldRelationMetadata,
} from '../FieldMetadata';

export const isFieldRelationManyToOne = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>,
): field is FieldDefinition<FieldRelationMetadata> =>
  isFieldRelation(field) &&
  field.metadata?.relationType === RelationType.MANY_TO_ONE;
