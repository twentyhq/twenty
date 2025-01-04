import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import {
  FieldMetadata,
  FieldRichTextDeprecatedMetadata,
} from '../FieldMetadata';

export const isFieldRichTextDeprecated = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldRichTextDeprecatedMetadata> =>
  field.type === FieldMetadataType.RichTextDeprecated;
