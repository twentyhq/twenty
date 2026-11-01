import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { cancelGuardedBooking } from 'src/logic-functions/handlers/cancel-guarded-booking-handler';
import { type CancelSplitParticipantInput } from 'src/logic-functions/utils/split-cancellation';

export default defineLogicFunction({
  universalIdentifier: '9c7cfa76-8983-4c57-9b86-670d229d736d',
  name: 'studio-cancel-split-participant',
  description: 'Record a late cancellation by one split participant',
  timeoutSeconds: 30,
  handler: async (routePayload: RoutePayload<CancelSplitParticipantInput>) => {
    const result = await cancelGuardedBooking(
      (routePayload.body ?? {}) as CancelSplitParticipantInput,
      'split-participant',
    );
    return new Response(result, {
      status: result.success ? 200 : result.status,
    });
  },
  httpRouteTriggerSettings: {
    path: '/studio/split-bookings/cancel-participant',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
