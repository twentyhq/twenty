import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '../FieldDefinition';
import {
  type FieldBooleanMetadata,
  type FieldMetadata,
} from '../FieldMetadata';

export const isFieldBoolean = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldBooleanMetadata> =>
  field.type === FieldMetadataType.BOOLEAN;
