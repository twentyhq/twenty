import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '../FieldDefinition';
import { type FieldMetadata, type FieldPhonesMetadata } from '../FieldMetadata';

export const isFieldPhones = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldPhonesMetadata> =>
  field.type === FieldMetadataType.PHONES;
