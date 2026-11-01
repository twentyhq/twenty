import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { cancelGuardedBooking } from 'src/logic-functions/handlers/cancel-guarded-booking-handler';
import { recordStudioEvent } from 'src/logic-functions/utils/studio-event';

type CancelRegularBookingInput = {
  bookingId: string;
  cancelledAt: string;
  idempotencyKey: string;
};

export default defineLogicFunction({
  universalIdentifier: 'b1946eca-1df3-4dc0-a22f-b4b187f37a4d',
  name: 'studio-cancel-regular-booking',
  description: 'Cancel a regular or personal booking and release one visit',
  timeoutSeconds: 30,
  handler: async (routePayload: RoutePayload<CancelRegularBookingInput>) => {
    const input = (routePayload.body ?? {}) as CancelRegularBookingInput;
    try {
      const result = await cancelGuardedBooking(input, 'regular');
      if (!result.success) {
        await recordStudioEvent({
          bookingId: input.bookingId,
          eventType: 'OPERATION_FAILED',
          idempotencyKey: input.idempotencyKey,
          outcome: 'FAILURE',
          details: result.message,
        });
      }

      return new Response(result, {
        status: result.success ? 200 : result.status,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Неизвестная ошибка отмены записи.';
      await recordStudioEvent({
        bookingId: input.bookingId,
        eventType: 'OPERATION_FAILED',
        idempotencyKey: input.idempotencyKey,
        outcome: 'FAILURE',
        details: message,
      });
      return new Response(
        { success: false, code: 'INTERNAL_ERROR', message },
        { status: 500 },
      );
    }
  },
  httpRouteTriggerSettings: {
    path: '/studio/bookings/cancel',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
