import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldURLV2Metadata } from '../FieldMetadata';

export const isFieldURLV2 = (
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldURLV2Metadata> => field.type === 'urlV2';
