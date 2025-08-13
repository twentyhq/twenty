import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '../FieldDefinition';
import { type FieldArrayMetadata, type FieldMetadata } from '../FieldMetadata';

export const isFieldArray = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldArrayMetadata> =>
  field.type === FieldMetadataType.ARRAY;
