import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '@/modules/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldAddressMetadata,
  type FieldMetadata,
} from '@/modules/object-record/record-field/ui/types/FieldMetadata';

export const isFieldAddress = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldAddressMetadata> =>
  field.type === FieldMetadataType.ADDRESS;
