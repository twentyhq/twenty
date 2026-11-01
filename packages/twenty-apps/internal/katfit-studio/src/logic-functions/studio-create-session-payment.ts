import { runAuditedStudioCommand } from 'src/logic-functions/utils/studio-command-audit';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import {
  createSessionPayment,
  type SessionPaymentInput,
} from 'src/logic-functions/handlers/create-session-payment-handler';

export default defineLogicFunction({
  universalIdentifier: '394874cb-c6e7-40b3-acf0-b44ce2d5a890',
  name: 'studio-create-session-payment',
  description:
    'Prepare a received single-session payment or future debt before saving a session',
  timeoutSeconds: 30,
  handler: async (
    payload: RoutePayload<SessionPaymentInput>,
    context: { userWorkspaceId: string | null },
  ) => {
    const input = (payload.body ?? {}) as SessionPaymentInput;
    const result = await runAuditedStudioCommand(
      'studio-create-session-payment',
      input,
      () => createSessionPayment(input),
      undefined,
      context,
    );
    return new Response(result, {
      status: result.success ? 200 : result.status,
    });
  },
  httpRouteTriggerSettings: {
    path: '/studio/sessions/payment',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
