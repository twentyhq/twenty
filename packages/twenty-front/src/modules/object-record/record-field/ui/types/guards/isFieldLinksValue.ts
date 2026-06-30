import { type FieldLinksValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { linksFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/linksFieldValueSchema';

export const isFieldLinksValue = (
  fieldValue: unknown,
): fieldValue is FieldLinksValue =>
  linksFieldValueSchema.safeParse(fieldValue).success;
