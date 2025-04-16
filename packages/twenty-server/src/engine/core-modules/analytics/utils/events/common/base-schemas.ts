import { z } from 'zod';

export const baseEventSchema = z
  .object({
    timestamp: z.string(),
    userId: z.string().nullish(),
    workspaceId: z.string().nullish(),
    version: z.string(),
  })
  .strict();
