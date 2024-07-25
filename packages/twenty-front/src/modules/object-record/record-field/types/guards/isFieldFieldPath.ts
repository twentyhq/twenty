import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldFieldPathMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldFieldPath = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldFieldPathMetadata> =>
  field.type === FieldMetadataType.FieldPath;
