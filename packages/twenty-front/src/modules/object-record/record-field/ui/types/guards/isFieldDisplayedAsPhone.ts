import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '../FieldDefinition';
import { type FieldMetadata, type FieldTextMetadata } from '../FieldMetadata';

// TODO: temporary - remove when 'Phone' field in 'Person' object
// is migrated to use FieldMetadataType.Phone as type.
export const isFieldDisplayedAsPhone = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>,
): field is FieldDefinition<FieldTextMetadata> =>
  field.metadata.objectMetadataNameSingular === CoreObjectNameSingular.Person &&
  field.type === FieldMetadataType.TEXT &&
  field.metadata.fieldName === 'phone';
