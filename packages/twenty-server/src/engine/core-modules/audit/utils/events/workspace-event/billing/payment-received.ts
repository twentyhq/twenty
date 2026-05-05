import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/audit/utils/events/workspace-event/track';

export const PAYMENT_RECEIVED_EVENT = 'Payment Received' as const;
export const paymentReceivedSchema = z.strictObject({
  event: z.literal(PAYMENT_RECEIVED_EVENT),
  properties: z.strictObject({
    amountPaid: z.number(),
  }),
});

export type PaymentReceivedTrackEvent = z.infer<typeof paymentReceivedSchema>;

registerEvent(PAYMENT_RECEIVED_EVENT, paymentReceivedSchema);
