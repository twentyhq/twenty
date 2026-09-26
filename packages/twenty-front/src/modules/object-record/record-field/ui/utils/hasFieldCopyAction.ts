import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldEmails } from '@/object-record/record-field/ui/types/guards/isFieldEmails';
import { isFieldLinks } from '@/object-record/record-field/ui/types/guards/isFieldLinks';
import { isFieldPhones } from '@/object-record/record-field/ui/types/guards/isFieldPhones';

export const hasFieldCopyAction = (
  fieldDefinition: Pick<FieldDefinition<FieldMetadata>, 'type'>,
) =>
  isFieldEmails(fieldDefinition) ||
  isFieldLinks(fieldDefinition) ||
  isFieldPhones(fieldDefinition);
