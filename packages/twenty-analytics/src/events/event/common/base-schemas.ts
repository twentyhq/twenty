import { z } from 'zod';

export const eventSchema = z.object({
  action: z.string(),
  timestamp: z.string().datetime({ local: true }),
  version: z.string(),
  userId: z.string().nullish(),
  workspaceId: z.string().nullish(),
  payload: z.record(z.any()).nullish(),
});
