import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMetadata,
  type FieldRelationMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';

export const isFieldRelation = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldRelationMetadata> =>
  field.type === FieldMetadataType.RELATION;
