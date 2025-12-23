import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '@/modules/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMetadata,
  type FieldPositionMetadata,
} from '@/modules/object-record/record-field/ui/types/FieldMetadata';

export const isFieldPosition = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldPositionMetadata> =>
  field.type === FieldMetadataType.POSITION;
