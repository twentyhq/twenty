import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '../FieldDefinition';
import { type FieldMetadata, type FieldUuidMetadata } from '../FieldMetadata';

export const isFieldUuid = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldUuidMetadata> =>
  field.type === FieldMetadataType.UUID;
