import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition.ts';
import {
  FieldMetadata,
  FieldMultiSelectMetadata,
} from '@/object-record/record-field/types/FieldMetadata.ts';
import { FieldMetadataType } from '~/generated-metadata/graphql.ts';

export const isFieldMultiSelect = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldMultiSelectMetadata> =>
  field.type === FieldMetadataType.MultiSelect;
