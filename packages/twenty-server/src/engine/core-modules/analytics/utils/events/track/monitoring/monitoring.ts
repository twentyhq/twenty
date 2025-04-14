import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/analytics/utils/events/track/track';

export const MONITORING_EVENT = 'Monitoring' as const;
export const monitoringSchema = z
  .object({
    event: z.literal(MONITORING_EVENT),
    properties: z
      .object({
        eventName: z.string(),
        connectedAccountId: z.string().optional(),
        messageChannelId: z.string().optional(),
        message: z.string().optional(),
      })
      .strict(),
  })
  .strict();

export type MonitoringTrackEvent = z.infer<typeof monitoringSchema>;

registerEvent(MONITORING_EVENT, monitoringSchema);
