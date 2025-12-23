import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '@/modules/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata, type FieldSelectMetadata } from '@/modules/object-record/record-field/ui/types/FieldMetadata';

export const isFieldSelect = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldSelectMetadata> =>
  field.type === FieldMetadataType.SELECT;
