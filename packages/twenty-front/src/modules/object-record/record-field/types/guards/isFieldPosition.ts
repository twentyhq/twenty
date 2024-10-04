import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldPositionMetadata } from '../FieldMetadata';

export const isFieldPosition = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldPositionMetadata> =>
  field.type === FieldMetadataType.Position;
