import { z } from 'zod';

import { baseEventSchema } from 'src/engine/core-modules/analytics/utils/events/common/base-schemas';

export const customDomainDeactivatedSchema = baseEventSchema.extend({
  action: z.literal('customDomain.deactivated'),
});
