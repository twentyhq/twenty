import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import {
  FieldMetadata,
  FieldMultiSelectMetadata,
} from '@/object-record/record-field/types/FieldMetadata';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const isFieldMultiSelect = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldMultiSelectMetadata> =>
  field.type === FieldMetadataType.MultiSelect;
