import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { confirmGuardedPayAsYouGoPayment } from 'src/logic-functions/handlers/confirm-guarded-pay-as-you-go-payment-handler';

type Input = {
  bookingId: string;
  fiscalReceiptId?: string;
  paidAt?: string;
  paymentMethod: 'CARD' | 'CASH' | 'SBP';
};

export default defineLogicFunction({
  universalIdentifier: '8c7655c3-0051-4e27-8de6-023d90b0e434',
  name: 'studio-confirm-pay-as-you-go-payment',
  description: 'Confirm an expected pay-as-you-go payment',
  timeoutSeconds: 30,
  handler: async (routePayload: RoutePayload<Input>) => {
    const result = await confirmGuardedPayAsYouGoPayment(
      (routePayload.body ?? {}) as Input,
    );
    return new Response(result, {
      status: result.success ? 200 : result.status,
    });
  },
  httpRouteTriggerSettings: {
    path: '/studio/bookings/confirm-pay-as-you-go-payment',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
