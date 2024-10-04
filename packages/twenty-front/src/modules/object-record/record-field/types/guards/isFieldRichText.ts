import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldRichTextMetadata } from '../FieldMetadata';

export const isFieldRichText = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldRichTextMetadata> =>
  field.type === FieldMetadataType.RichText;
