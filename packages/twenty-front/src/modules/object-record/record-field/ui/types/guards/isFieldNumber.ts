import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '../FieldDefinition';
import { type FieldMetadata, type FieldNumberMetadata } from '../FieldMetadata';

export const isFieldNumber = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldNumberMetadata> =>
  field.type === FieldMetadataType.NUMBER;
