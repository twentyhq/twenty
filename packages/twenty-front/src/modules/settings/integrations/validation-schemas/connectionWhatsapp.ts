import { z } from 'zod';

export const connectionWhatsapp = z.object({
  businessId: z.string().default(''),
  webhookToken: z.string().default(''),
  bearerToken: z.string().default(''),
});
