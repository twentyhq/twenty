import { z } from 'zod';

import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export const phonesFieldValueSchema = z.object({
  primaryPhoneNumber: z.string().nullable(),
  primaryPhoneCountryCode: z.string(),
  primaryPhoneCallingCode: z.string().optional(),
  additionalPhones: z
    .array(
      z.object({
        number: z.string(),
        callingCode: z.string(),
        countryCode: z.string(),
      }),
    )
    .nullable(),
}) satisfies z.ZodType<FieldPhonesValue>;
