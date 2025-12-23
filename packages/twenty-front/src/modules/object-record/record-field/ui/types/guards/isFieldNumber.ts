import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '@/modules/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata, type FieldNumberMetadata } from '@/modules/object-record/record-field/ui/types/FieldMetadata';

export const isFieldNumber = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldNumberMetadata> =>
  field.type === FieldMetadataType.NUMBER;
