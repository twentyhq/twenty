import { z } from 'zod';

import { baseEventSchema } from 'src/engine/core-modules/audit/utils/events/common/base-schemas';

export const pageviewSchema = baseEventSchema.extend({
  type: z.literal('page'),
  name: z.string(),
  properties: z.object({
    href: z.string().optional().prefault(''),
    locale: z.string().optional().prefault(''),
    pathname: z.string().optional().prefault(''),
    referrer: z.string().optional().prefault(''),
    sessionId: z.string().optional().prefault(''),
    timeZone: z.string().optional().prefault(''),
    userAgent: z.string().optional().prefault(''),
  }),
});

export type PageviewProperties = z.infer<typeof pageviewSchema>['properties'];
