import { z } from 'zod';

export const pageviewSchema = z.object({
  href: z.string(),
  locale: z.string(),
  pathname: z.string(),
  referrer: z.string(),
  sessionId: z.string(),
  timeZone: z.string(),
  timestamp: z.string(),
  userAgent: z.string(),
  version: z.string(),
  userId: z.string().nullish(),
  workspaceId: z.string().nullish(),
});
