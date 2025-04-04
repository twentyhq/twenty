import { z } from 'zod';

import { eventSchema } from 'src/engine/core-modules/analytics/utils/event/common/base-schemas';

export const customDomainActivatedSchema = eventSchema.extend({
  action: z.literal('customDomain.activated'),
});
