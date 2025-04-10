import { z } from 'zod';

import { baseEventSchema } from 'src/engine/core-modules/analytics/utils/events/common/base-schemas';

export const customDomainActivatedSchema = baseEventSchema.extend({
  action: z.literal('customDomain.activated'),
});
