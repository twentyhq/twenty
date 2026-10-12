import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { createPayAsYouGoBooking } from 'src/logic-functions/handlers/create-pay-as-you-go-booking-handler';

type CreatePayAsYouGoBookingInput = { classSessionId: string; idempotencyKey: string; personId: string; productId: string };

export default defineLogicFunction({
  universalIdentifier: 'd5f5c2d8-b062-478b-a31a-529e4d4cbfd8',
  name: 'studio-create-pay-as-you-go-booking',
  description: 'Create a booking with an expected payment',
  timeoutSeconds: 30,
  handler: async (routePayload: RoutePayload<CreatePayAsYouGoBookingInput>) => {
    const result = await createPayAsYouGoBooking((routePayload.body ?? {}) as CreatePayAsYouGoBookingInput);
    return new Response(result, { status: result.success ? 200 : result.status });
  },
  httpRouteTriggerSettings: { path: '/studio/bookings/create-pay-as-you-go', httpMethod: 'POST', isAuthRequired: true },
});
