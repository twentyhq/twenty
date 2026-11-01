import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { confirmGuardedSplitPayment } from 'src/logic-functions/handlers/confirm-guarded-membership-payment-handler';
import { type ConfirmSplitPaymentInput } from 'src/logic-functions/utils/split-payment';

const handler = async (
  routePayload: RoutePayload<ConfirmSplitPaymentInput>,
): Promise<Response> => {
  const result = await confirmGuardedSplitPayment(
    (routePayload.body ?? {}) as ConfirmSplitPaymentInput,
  );

  return new Response(result, { status: result.success ? 200 : result.status });
};

export default defineLogicFunction({
  universalIdentifier: '9ea48b27-7937-4a23-9a11-e67ee7295cbc',
  name: 'studio-confirm-split-payment',
  description: 'Confirm a fully paid shared split block for a pair',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/studio/split-payments/confirm',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
