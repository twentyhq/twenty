import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '../FieldDefinition';
import { type FieldMetadata, type FieldTextMetadata } from '../FieldMetadata';

export const isFieldText = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldTextMetadata> =>
  field.type === FieldMetadataType.TEXT;
