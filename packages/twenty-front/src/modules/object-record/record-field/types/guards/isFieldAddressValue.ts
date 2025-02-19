import { z } from 'zod';

import { FieldAddressValue } from '../FieldMetadata';

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
