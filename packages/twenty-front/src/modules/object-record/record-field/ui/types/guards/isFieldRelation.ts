import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '../FieldDefinition';
import {
  type FieldMetadata,
  type FieldRelationMetadata,
} from '../FieldMetadata';

export const isFieldRelation = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldRelationMetadata> =>
  field.type === FieldMetadataType.RELATION;
