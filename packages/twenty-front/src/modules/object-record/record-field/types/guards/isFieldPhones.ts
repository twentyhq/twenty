import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldPhonesMetadata } from '../FieldMetadata';

export const isFieldPhones = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldPhonesMetadata> =>
  field.type === FieldMetadataType.Phones;
