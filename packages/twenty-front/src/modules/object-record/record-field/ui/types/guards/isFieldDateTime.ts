import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '@/modules/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldDateTimeMetadata,
  type FieldMetadata,
} from '@/modules/object-record/record-field/ui/types/FieldMetadata';

export const isFieldDateTime = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldDateTimeMetadata> =>
  field.type === FieldMetadataType.DATE_TIME;
