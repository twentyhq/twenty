import { z } from 'zod';

import { baseEventSchema } from 'src/engine/core-modules/analytics/utils/events/common/base-schemas';

export const pageviewSchema = baseEventSchema.extend({
  type: z.literal('page'),
  name: z.string(),
  properties: z.object({
    href: z.string(),
    locale: z.string(),
    pathname: z.string(),
    referrer: z.string(),
    sessionId: z.string(),
    timeZone: z.string(),
    userAgent: z.string(),
  }),
});

export type PageviewProperties = z.infer<typeof pageviewSchema>['properties'];
