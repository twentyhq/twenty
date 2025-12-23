import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMetadata,
  type FieldUuidMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';

export const isFieldUuid = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldUuidMetadata> =>
  field.type === FieldMetadataType.UUID;
