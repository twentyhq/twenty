import { z } from 'zod';

// Base payload schemas
export const emptyPayloadSchema = z.object({}).strict();

// Base event schema
export const eventSchema = z
  .object({
    action: z.string(),
    timestamp: z.string().datetime(),
    version: z.string(),
    userId: z.string().default(''),
    workspaceId: z.string().default(''),
    payload: z.record(z.any()),
  })
  .strict();
