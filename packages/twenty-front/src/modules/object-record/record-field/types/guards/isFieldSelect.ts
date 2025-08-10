import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '../FieldDefinition';
import { type FieldMetadata, type FieldSelectMetadata } from '../FieldMetadata';

export const isFieldSelect = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldSelectMetadata> =>
  field.type === FieldMetadataType.SELECT;
