import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldRichTextV2Metadata } from '../FieldMetadata';

export const isFieldRichTextV2 = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldRichTextV2Metadata> =>
  field.type === FieldMetadataType.RICH_TEXT_V2;
