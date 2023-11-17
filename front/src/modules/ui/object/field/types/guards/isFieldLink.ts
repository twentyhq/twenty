import { FieldDefinition } from '../FieldDefinition';
import { FieldLinkMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldLink = (
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldLinkMetadata> => field.type === 'LINK';
