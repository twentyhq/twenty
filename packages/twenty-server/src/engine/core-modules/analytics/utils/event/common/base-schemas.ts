import { z } from 'zod';

export const eventSchema = z
  .object({
    action: z.string(),
    timestamp: z.string(),
    version: z.string(),
    userId: z.string().nullish(),
    workspaceId: z.string().nullish(),
    payload: z.optional(z.nullable(z.any())),
  })
  .strict();
