import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMetadata,
  type FieldRichTextMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';

export const isFieldRichText = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldRichTextMetadata> =>
  field.type === FieldMetadataType.RICH_TEXT;
