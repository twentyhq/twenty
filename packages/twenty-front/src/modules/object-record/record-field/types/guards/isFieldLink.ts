import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldLinkMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldLink = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldLinkMetadata> =>
  field.type === FieldMetadataType.Link;
