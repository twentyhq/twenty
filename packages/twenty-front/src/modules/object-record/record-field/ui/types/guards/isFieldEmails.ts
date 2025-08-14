import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '../FieldDefinition';
import { type FieldEmailsMetadata, type FieldMetadata } from '../FieldMetadata';

export const isFieldEmails = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldEmailsMetadata> =>
  field.type === FieldMetadataType.EMAILS;
