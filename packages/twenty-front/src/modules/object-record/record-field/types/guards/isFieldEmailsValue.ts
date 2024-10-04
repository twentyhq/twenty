import { z } from 'zod';

import { FieldEmailsValue } from '@/object-record/record-field/types/FieldMetadata';

export const emailsSchema = z.object({
  primaryEmail: z.string(),
  additionalEmails: z.array(z.string()).nullable(),
}) satisfies z.ZodType<FieldEmailsValue>;

export const isFieldEmailsValue = (
  fieldValue: unknown,
): fieldValue is FieldEmailsValue => emailsSchema.safeParse(fieldValue).success;
