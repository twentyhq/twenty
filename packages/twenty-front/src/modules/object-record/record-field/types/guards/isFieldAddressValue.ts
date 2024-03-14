import { z } from 'zod';

import { FieldAddressValue } from '../FieldMetadata';

const addressSchema = z.object({
  addressStreet1: z.string(),
  addressStreet2: z.string(),
  addressCity: z.string(),
  addressState: z.string(),
  addressPostalcode: z.string(),
  addressCountry: z.string(),
  addressLat: z.number(),
  addressLng: z.number(),
});

export const isFieldAddressValue = (
  fieldValue: unknown,
): fieldValue is FieldAddressValue =>
  addressSchema.safeParse(fieldValue).success;
