import { z } from 'zod';

import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';

const fullnameSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
});

export const isFieldFullNameValue = (
  fieldValue: unknown,
): fieldValue is FieldFullNameValue =>
  fullnameSchema.safeParse(fieldValue).success;
