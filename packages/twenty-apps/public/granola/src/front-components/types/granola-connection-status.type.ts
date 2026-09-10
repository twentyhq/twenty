import { z } from 'zod';

export const GRANOLA_CONNECTION_STATUS_SCHEMA = z.object({
  isConnected: z.boolean(),
  isApiKeySet: z.boolean(),
  isGranolaReachable: z.boolean().default(true),
  error: z.string().optional(),
});

export type GranolaConnectionStatus = z.infer<
  typeof GRANOLA_CONNECTION_STATUS_SCHEMA
>;
