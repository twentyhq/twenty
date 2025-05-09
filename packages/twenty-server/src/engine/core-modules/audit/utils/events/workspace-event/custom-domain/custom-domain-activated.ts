import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/audit/utils/events/workspace-event/track';

export const CUSTOM_DOMAIN_ACTIVATED_EVENT = 'Custom Domain Activated' as const;
export const customDomainActivatedSchema = z
  .object({
    event: z.literal(CUSTOM_DOMAIN_ACTIVATED_EVENT),
    properties: z.object({}).strict(),
  })
  .strict();

export type CustomDomainActivatedTrackEvent = z.infer<
  typeof customDomainActivatedSchema
>;

registerEvent(CUSTOM_DOMAIN_ACTIVATED_EVENT, customDomainActivatedSchema);
