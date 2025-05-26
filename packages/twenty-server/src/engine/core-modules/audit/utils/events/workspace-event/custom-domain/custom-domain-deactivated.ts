import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/audit/utils/events/workspace-event/track';

export const CUSTOM_DOMAIN_DEACTIVATED_EVENT =
  'Custom Domain Deactivated' as const;
export const customDomainDeactivatedSchema = z
  .object({
    event: z.literal(CUSTOM_DOMAIN_DEACTIVATED_EVENT),
    properties: z.object({}).strict(),
  })
  .strict();

export type CustomDomainDeactivatedTrackEvent = z.infer<
  typeof customDomainDeactivatedSchema
>;

registerEvent(CUSTOM_DOMAIN_DEACTIVATED_EVENT, customDomainDeactivatedSchema);
