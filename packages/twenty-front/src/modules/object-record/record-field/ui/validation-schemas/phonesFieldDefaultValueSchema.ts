import { z } from 'zod';

export const phonesFieldDefaultValueSchema = z.object({
  primaryPhoneNumber: z.string().nullable(),
  primaryPhoneCountryCode: z.string().nullable(),
  primaryPhoneCallingCode: z.string().nullable().optional(),
  additionalPhones: z
    .array(
      z.object({
        number: z.string(),
        callingCode: z.string(),
        countryCode: z.string(),
      }),
    )
    .nullable(),
});
