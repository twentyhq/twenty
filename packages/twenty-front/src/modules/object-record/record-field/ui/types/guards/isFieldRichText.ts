import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMetadata,
  type FieldRichTextV2Metadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';

export const isFieldRichTextV2 = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldRichTextV2Metadata> =>
  field.type === FieldMetadataType.RICH_TEXT_V2;
