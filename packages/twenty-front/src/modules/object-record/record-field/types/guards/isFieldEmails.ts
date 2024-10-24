import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldEmailsMetadata, FieldMetadata } from '../FieldMetadata';

export const isFieldEmails = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldEmailsMetadata> =>
  field.type === FieldMetadataType.Emails;
