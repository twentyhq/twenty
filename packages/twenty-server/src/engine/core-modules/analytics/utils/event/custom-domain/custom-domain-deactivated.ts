import { z } from 'zod';

import { eventSchema } from 'src/engine/core-modules/analytics/utils/event/common/base-schemas';

export const customDomainDeactivatedSchema = eventSchema.extend({
  action: z.literal('customDomain.deactivated'),
});
