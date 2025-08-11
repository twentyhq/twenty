import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '../FieldDefinition';
import {
  type FieldMetadata,
  type FieldRawJsonMetadata,
} from '../FieldMetadata';

export const isFieldRawJson = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldRawJsonMetadata> =>
  field.type === FieldMetadataType.RAW_JSON;
