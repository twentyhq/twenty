import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldDefinition } from '@/modules/object-record/record-field/ui/types/FieldDefinition';
import { type FieldEmailsMetadata, type FieldMetadata } from '@/modules/object-record/record-field/ui/types/FieldMetadata';

export const isFieldEmails = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldEmailsMetadata> =>
  field.type === FieldMetadataType.EMAILS;
