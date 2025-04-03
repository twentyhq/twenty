import { z } from 'zod';

export const pageviewSchema = z.object({
  href: z.string(),
  locale: z.string(),
  pathname: z.string(),
  referrer: z.string(),
  sessionId: z.string(),
  timeZone: z.string(),
  timestamp: z.string().datetime(),
  userAgent: z.string(),
  userId: z.string().optional().default(''),
  version: z.string(),
  workspaceId: z.string().optional().default(''),
});
