import { z } from 'zod';

export const addressFieldValueSchema = z.object({
  addressStreet1: z.string().nullable(),
  addressStreet2: z.string().nullable(),
  addressCity: z.string().nullable(),
  addressState: z.string().nullable(),
  addressPostcode: z.string().nullable(),
  addressCountry: z.string().nullable(),
  addressLat: z.number().nullable(),
  addressLng: z.number().nullable(),
});
