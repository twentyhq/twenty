import { z } from 'zod';

export const credentialsSchema = z.object({
  serverUrl: z.string().url(),
  clientId: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.number(),
});
