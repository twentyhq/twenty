import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldRawJsonMetadata } from '../FieldMetadata';

export const isFieldRawJson = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldRawJsonMetadata> =>
  field.type === FieldMetadataType.RawJson;
