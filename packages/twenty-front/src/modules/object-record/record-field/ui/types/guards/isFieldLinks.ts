import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '../FieldDefinition';
import { type FieldLinksMetadata, type FieldMetadata } from '../FieldMetadata';

export const isFieldLinks = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldLinksMetadata> =>
  field.type === FieldMetadataType.LINKS;
