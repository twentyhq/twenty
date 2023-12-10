import { FieldMetadataType } from '~/generated/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldSelectMetadata } from '../FieldMetadata';

export const isFieldSelect = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldSelectMetadata> =>
  field.type === FieldMetadataType.Select;
