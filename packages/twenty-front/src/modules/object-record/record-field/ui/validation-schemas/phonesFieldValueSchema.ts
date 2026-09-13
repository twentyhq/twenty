import { z } from 'zod';

import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export const phonesFieldValueSchema = z.object({
  primaryPhoneNumber: z.string().nullable(),
  primaryPhoneCountryCode: z.string().nullable(),
  primaryPhoneCallingCode: z.string().nullable().optional(),
  additionalPhones: z
    .array(
      z.object({
        number: z.string().nullable(),
        callingCode: z.string().nullable(),
        countryCode: z.string().nullable(),
      }),
    )
    .nullable(),
}) satisfies z.ZodType<FieldPhonesValue>;
