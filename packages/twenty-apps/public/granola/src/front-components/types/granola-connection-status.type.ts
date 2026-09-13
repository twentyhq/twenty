import { z } from 'zod';

import { GRANOLA_WEBHOOK_SCOPE_SCHEMA } from 'src/logic-functions/types/granola-api.type';

export const GRANOLA_CONNECTION_STATUS_SCHEMA = z.object({
  isConnected: z.boolean(),
  isApiKeySet: z.boolean(),
  isGranolaReachable: z.boolean().default(true),
  canManage: z.boolean().default(false),
  needsRegistration: z.boolean().default(false),
  error: z.string().optional(),
  registration: z
    .object({
      scopes: z.array(GRANOLA_WEBHOOK_SCOPE_SCHEMA),
      isActive: z.boolean(),
    })
    .optional(),
});

export type GranolaConnectionStatus = z.infer<
  typeof GRANOLA_CONNECTION_STATUS_SCHEMA
>;
