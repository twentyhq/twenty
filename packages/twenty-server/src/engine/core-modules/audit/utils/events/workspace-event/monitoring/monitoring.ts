import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/audit/utils/events/workspace-event/track';

export const MONITORING_EVENT = 'Monitoring' as const;
export const monitoringSchema = z.strictObject({
  event: z.literal(MONITORING_EVENT),
  properties: z.strictObject({
    eventName: z.string(),
    connectedAccountId: z.string().optional(),
    messageChannelId: z.string().optional(),
    message: z.string().optional(),
  }),
});

export type MonitoringTrackEvent = z.infer<typeof monitoringSchema>;

registerEvent(MONITORING_EVENT, monitoringSchema);
