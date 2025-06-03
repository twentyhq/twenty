import { z } from 'zod';

import { baseEventSchema } from 'src/engine/core-modules/audit/utils/events/common/base-schemas';

export const pageviewSchema = baseEventSchema.extend({
  type: z.literal('page'),
  name: z.string(),
  properties: z.object({
    href: z.string().optional().default(''),
    locale: z.string().optional().default(''),
    pathname: z.string().optional().default(''),
    referrer: z.string().optional().default(''),
    sessionId: z.string().optional().default(''),
    timeZone: z.string().optional().default(''),
    userAgent: z.string().optional().default(''),
  }),
});

export type PageviewProperties = z.infer<typeof pageviewSchema>['properties'];
