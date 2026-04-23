import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMetadata,
  type FieldPhonesMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';

export const isFieldPhones = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldPhonesMetadata> =>
  field.type === FieldMetadataType.PHONES;
