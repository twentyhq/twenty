import { z } from 'zod/v3';

export const baseEventSchema = z
  .object({
    timestamp: z.string(),
    userId: z.string().nullish(),
    workspaceId: z.string().nullish(),
    version: z.string(),
  })
  .strict();
