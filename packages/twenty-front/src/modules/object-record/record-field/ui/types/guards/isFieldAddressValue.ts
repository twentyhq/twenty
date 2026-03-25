import { z } from 'zod';

import { ALLOWED_ADDRESS_SUBFIELDS } from 'twenty-shared/types';
import { type FieldAddressValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export const addressSchema = z.object({
  addressStreet1: z.string(),
  addressStreet2: z.string().nullable(),
  addressCity: z.string().nullable(),
  addressState: z.string().nullable(),
  addressPostcode: z.string().nullable(),
  addressCountry: z.string().nullable(),
  addressLat: z.number().nullable(),
  addressLng: z.number().nullable(),
});

export const isFieldAddressValue = (
  fieldValue: unknown,
): fieldValue is FieldAddressValue =>
  addressSchema.safeParse(fieldValue).success;

export const addressSettingsSchema = z.object({
  subFields: z
    .array(z.enum(ALLOWED_ADDRESS_SUBFIELDS))
    .min(1)
    .optional()
    .nullable(),
});
