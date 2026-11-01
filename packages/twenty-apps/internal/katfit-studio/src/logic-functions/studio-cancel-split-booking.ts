import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { cancelGuardedBooking } from 'src/logic-functions/handlers/cancel-guarded-booking-handler';
import { type CancelSplitBookingInput } from 'src/logic-functions/utils/split-cancellation';

export default defineLogicFunction({
  universalIdentifier: '65ce48b4-48b1-45ee-8bf9-b21e5dda3809',
  name: 'studio-cancel-split-booking',
  description: 'Cancel a pair slot and release or consume one shared visit',
  timeoutSeconds: 30,
  handler: async (routePayload: RoutePayload<CancelSplitBookingInput>) => {
    const result = await cancelGuardedBooking(
      (routePayload.body ?? {}) as CancelSplitBookingInput,
      'split',
    );
    return new Response(result, {
      status: result.success ? 200 : result.status,
    });
  },
  httpRouteTriggerSettings: {
    path: '/studio/split-bookings/cancel',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
