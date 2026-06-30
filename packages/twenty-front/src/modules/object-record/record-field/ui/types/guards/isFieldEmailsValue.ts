import { type FieldEmailsValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { emailsFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/emailsFieldValueSchema';

export const isFieldEmailsValue = (
  fieldValue: unknown,
): fieldValue is FieldEmailsValue =>
  emailsFieldValueSchema.safeParse(fieldValue).success;
