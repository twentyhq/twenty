import { z } from 'zod';

import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { additionalPhoneSchema } from 'twenty-shared/utils';

export const phonesFieldValueSchema = z.object({
  primaryPhoneNumber: z.string(),
  primaryPhoneCountryCode: z.string(),
  primaryPhoneCallingCode: z.string().optional(),
  additionalPhones: z.array(additionalPhoneSchema.required()).nullable(),
}) satisfies z.ZodType<FieldPhonesValue>;
