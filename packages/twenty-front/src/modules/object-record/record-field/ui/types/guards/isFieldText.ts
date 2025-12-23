import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '@/modules/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata, type FieldTextMetadata } from '@/modules/object-record/record-field/ui/types/FieldMetadata';

export const isFieldText = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldTextMetadata> =>
  field.type === FieldMetadataType.TEXT;
