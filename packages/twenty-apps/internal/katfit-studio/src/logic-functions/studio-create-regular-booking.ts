import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { createGuardedRegularBooking } from 'src/logic-functions/handlers/create-guarded-regular-booking-handler';
import { recordStudioEvent } from 'src/logic-functions/utils/studio-event';

type CreateRegularBookingInput = {
  classSessionId: string;
  idempotencyKey: string;
  membershipId: string;
  personId: string;
};

export default defineLogicFunction({
  universalIdentifier: '58a3e8b2-0fd2-4d90-b39b-d678e89b1126',
  name: 'studio-create-regular-booking',
  description: 'Create a regular or personal booking and reserve one visit',
  timeoutSeconds: 30,
  handler: async (routePayload: RoutePayload<CreateRegularBookingInput>) => {
    const input = (routePayload.body ?? {}) as CreateRegularBookingInput;
    try {
      const result = await createGuardedRegularBooking(input);
      if (!result.success) {
        await recordStudioEvent({ classSessionId: input.classSessionId, eventType: 'OPERATION_FAILED', idempotencyKey: input.idempotencyKey, membershipId: input.membershipId, outcome: 'FAILURE', details: result.message });
      }

      return new Response(result, { status: result.success ? 200 : result.status });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка создания записи.';
      await recordStudioEvent({ classSessionId: input.classSessionId, eventType: 'OPERATION_FAILED', idempotencyKey: input.idempotencyKey, membershipId: input.membershipId, outcome: 'FAILURE', details: message });
      return new Response({ success: false, code: 'INTERNAL_ERROR', message }, { status: 500 });
    }
  },
  httpRouteTriggerSettings: {
    path: '/studio/bookings/create',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
