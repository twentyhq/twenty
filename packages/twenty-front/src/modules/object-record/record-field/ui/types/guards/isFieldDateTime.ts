import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '../FieldDefinition';
import {
  type FieldDateTimeMetadata,
  type FieldMetadata,
} from '../FieldMetadata';

export const isFieldDateTime = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldDateTimeMetadata> =>
  field.type === FieldMetadataType.DATE_TIME;
