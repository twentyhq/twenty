import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldFullNameMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldFullName = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldFullNameMetadata> =>
  field.type === FieldMetadataType.FullName;
