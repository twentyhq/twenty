import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { cancelGuardedBooking } from 'src/logic-functions/handlers/cancel-guarded-booking-handler';

type Input = { bookingId: string; cancelledAt: string; idempotencyKey: string };

export default defineLogicFunction({
  universalIdentifier: 'd7da98d1-e5dc-40bf-8ad3-52b59bdfa48d',
  name: 'studio-cancel-pay-as-you-go-booking',
  description: 'Cancel a pay-as-you-go booking and waive its expected payment',
  timeoutSeconds: 30,
  handler: async (routePayload: RoutePayload<Input>) => {
    const result = await cancelGuardedBooking(
      (routePayload.body ?? {}) as Input,
      'pay-as-you-go',
    );
    return new Response(result, {
      status: result.success ? 200 : result.status,
    });
  },
  httpRouteTriggerSettings: {
    path: '/studio/bookings/cancel-pay-as-you-go',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
