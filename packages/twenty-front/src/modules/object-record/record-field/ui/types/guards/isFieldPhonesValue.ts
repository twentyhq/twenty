import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { phonesFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/phonesFieldValueSchema';

export const isFieldPhonesValue = (
  fieldValue: unknown,
): fieldValue is FieldPhonesValue =>
  phonesFieldValueSchema.safeParse(fieldValue).success;
