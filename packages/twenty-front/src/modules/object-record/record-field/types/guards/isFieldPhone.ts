import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldPhoneMetadata } from '../FieldMetadata';

export const isFieldPhone = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldPhoneMetadata> =>
  field.type === FieldMetadataType.Phone;
