import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { createGuardedPayAsYouGoBooking } from 'src/logic-functions/handlers/create-guarded-pay-as-you-go-booking-handler';
import { recordStudioEvent } from 'src/logic-functions/utils/studio-event';

type CreatePayAsYouGoBookingInput = { classSessionId: string; idempotencyKey: string; personId: string; productId: string };

export default defineLogicFunction({
  universalIdentifier: 'd5f5c2d8-b062-478b-a31a-529e4d4cbfd8',
  name: 'studio-create-pay-as-you-go-booking',
  description: 'Create a booking with an expected payment',
  timeoutSeconds: 30,
  handler: async (routePayload: RoutePayload<CreatePayAsYouGoBookingInput>) => {
    const input = (routePayload.body ?? {}) as CreatePayAsYouGoBookingInput;

    try {
      const result = await createGuardedPayAsYouGoBooking(input);

      if (!result.success) {
        await recordStudioEvent({
          classSessionId: input.classSessionId,
          details: result.message,
          eventType: 'OPERATION_FAILED',
          idempotencyKey: input.idempotencyKey,
          outcome: 'FAILURE',
        });
      }

      return new Response(result, { status: result.success ? 200 : result.status });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Неизвестная ошибка создания записи.';

      await recordStudioEvent({
        classSessionId: input.classSessionId,
        details: message,
        eventType: 'OPERATION_FAILED',
        idempotencyKey: input.idempotencyKey,
        outcome: 'FAILURE',
      });

      return new Response(
        { success: false, code: 'INTERNAL_ERROR', message },
        { status: 500 },
      );
    }
  },
  httpRouteTriggerSettings: { path: '/studio/bookings/create-pay-as-you-go', httpMethod: 'POST', isAuthRequired: true },
});
