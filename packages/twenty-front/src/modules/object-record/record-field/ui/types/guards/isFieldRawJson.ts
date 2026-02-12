import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMetadata,
  type FieldRawJsonMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';

export const isFieldRawJson = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldRawJsonMetadata> =>
  field.type === FieldMetadataType.RAW_JSON;
