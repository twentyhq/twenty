import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '../FieldDefinition';
import {
  type FieldAddressMetadata,
  type FieldMetadata,
} from '../FieldMetadata';

export const isFieldAddress = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldAddressMetadata> =>
  field.type === FieldMetadataType.ADDRESS;
