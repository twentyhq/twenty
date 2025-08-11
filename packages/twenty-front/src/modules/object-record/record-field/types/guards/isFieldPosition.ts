import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '../FieldDefinition';
import {
  type FieldMetadata,
  type FieldPositionMetadata,
} from '../FieldMetadata';

export const isFieldPosition = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldPositionMetadata> =>
  field.type === FieldMetadataType.POSITION;
