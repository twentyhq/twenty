import { z } from 'zod/v4';

import { registerEvent } from 'src/engine/core-modules/audit/utils/events/workspace-event/track';

export const CUSTOM_DOMAIN_DEACTIVATED_EVENT =
  'Custom Domain Deactivated' as const;
export const customDomainDeactivatedSchema = z.strictObject({
  event: z.literal(CUSTOM_DOMAIN_DEACTIVATED_EVENT),
  properties: z.strictObject({}),
});

export type CustomDomainDeactivatedTrackEvent = z.infer<
  typeof customDomainDeactivatedSchema
>;

registerEvent(CUSTOM_DOMAIN_DEACTIVATED_EVENT, customDomainDeactivatedSchema);
