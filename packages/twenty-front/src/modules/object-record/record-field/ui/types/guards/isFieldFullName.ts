import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '../FieldDefinition';
import {
  type FieldFullNameMetadata,
  type FieldMetadata,
} from '../FieldMetadata';

export const isFieldFullName = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldFullNameMetadata> =>
  field.type === FieldMetadataType.FULL_NAME;
