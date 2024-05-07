import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldDateTimeMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldDateTime = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldDateTimeMetadata> =>
  field.type === FieldMetadataType.DateTime;
