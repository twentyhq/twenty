import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '../FieldDefinition';
import {
  type FieldMetadata,
  type FieldRichTextMetadata,
} from '../FieldMetadata';

export const isFieldRichText = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldRichTextMetadata> =>
  field.type === FieldMetadataType.RICH_TEXT;
