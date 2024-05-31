import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldLinksMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldLinks = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldLinksMetadata> =>
  field.type === FieldMetadataType.Links;
