import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldRichTextOldMetadata } from '../FieldMetadata';

export const isFieldRichTextOld = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldRichTextOldMetadata> =>
  field.type === FieldMetadataType.RichTextOld;
