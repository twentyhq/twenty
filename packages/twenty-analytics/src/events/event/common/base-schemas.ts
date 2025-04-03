import { z } from 'zod';

// Base payload schemas
export const emptyPayloadSchema = z.object({}).strict();

// Base event schema
export const eventSchema = z.object({
  action: z.string(),
  timestamp: z.string().datetime({ local: true }),
  version: z.string(),
  userId: z.string().optional().default(''),
  workspaceId: z.string().optional().default(''),
  payload: z.record(z.any()),
});
