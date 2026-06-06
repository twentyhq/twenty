import { z } from 'zod';

import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { PhoneType } from 'twenty-shared/types';

export const phonesFieldValueSchema = z.object({
  primaryPhoneNumber: z.string(),
  primaryPhoneCountryCode: z.string(),
  primaryPhoneCallingCode: z.string().optional(),
  primaryPhoneType: z.nativeEnum(PhoneType).nullable().optional(),
  primaryPhoneExtension: z.string().nullable().optional(),
  additionalPhones: z
    .array(
      z.object({
        number: z.string(),
        callingCode: z.string(),
        countryCode: z.string(),
        phoneType: z.nativeEnum(PhoneType).nullable().optional(),
        extension: z.string().nullable().optional(),
      }),
    )
    .nullable(),
}) satisfies z.ZodType<FieldPhonesValue>;
