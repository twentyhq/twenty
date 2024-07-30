import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldCreatedByMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldCreatedBy = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldCreatedByMetadata> =>
  field.type === FieldMetadataType.CreatedBy;
