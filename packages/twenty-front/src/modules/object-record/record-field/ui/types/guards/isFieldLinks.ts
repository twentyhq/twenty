import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldLinksMetadata,
  type FieldMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';

export const isFieldLinks = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldLinksMetadata> =>
  field.type === FieldMetadataType.LINKS;
