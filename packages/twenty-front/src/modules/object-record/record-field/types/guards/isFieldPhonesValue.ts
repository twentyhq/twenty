import { z } from 'zod';

import { FieldPhonesValue } from '../FieldMetadata';

export const phonesSchema = z.object({
  primaryPhoneNumber: z.string(),
  primaryPhoneCountryCode: z.string(),
  primaryPhoneCallingCode: z.string(),
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

export const isFieldPhonesValue = (
  fieldValue: unknown,
): fieldValue is FieldPhonesValue => phonesSchema.safeParse(fieldValue).success;
