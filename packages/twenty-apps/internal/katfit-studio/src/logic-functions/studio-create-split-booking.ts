import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { createGuardedSplitBooking } from 'src/logic-functions/handlers/create-guarded-split-booking-handler';
import { type CreateSplitBookingInput } from 'src/logic-functions/utils/split-booking';

const handler = async (
  routePayload: RoutePayload<CreateSplitBookingInput>,
): Promise<Response> => {
  const result = await createGuardedSplitBooking(
    (routePayload.body ?? {}) as CreateSplitBookingInput,
  );

  return new Response(result, { status: result.success ? 200 : result.status });
};

export default defineLogicFunction({
  universalIdentifier: '957873cd-4ce8-43da-a861-1a2ae521672a',
  name: 'studio-create-split-booking',
  description: 'Create two client bookings and reserve one shared split visit',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/studio/split-bookings/create',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
