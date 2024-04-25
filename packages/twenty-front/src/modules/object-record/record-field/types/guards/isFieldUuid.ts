import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldUuidMetadata } from '../FieldMetadata';

export const isFieldUuid = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldUuidMetadata> =>
  field.type === FieldMetadataType.Uuid;
