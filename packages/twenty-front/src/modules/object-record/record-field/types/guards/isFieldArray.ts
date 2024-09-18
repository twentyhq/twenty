import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldArrayMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldArray = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldArrayMetadata> =>
  field.type === FieldMetadataType.Array;
