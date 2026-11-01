import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';
import {
  cancelClassSession,
  type CancelClassSessionInput,
} from 'src/logic-functions/handlers/cancel-class-session-handler';

export default defineLogicFunction({
  universalIdentifier: '71da876c-5d65-44bd-9db9-5afdf178f5e1',
  name: 'studio-cancel-class-session',
  description:
    'Cancel a future session while preserving booking and financial history',
  timeoutSeconds: 60,
  handler: async (routePayload: RoutePayload<CancelClassSessionInput>) => {
    const result = await cancelClassSession(
      (routePayload.body ?? {}) as CancelClassSessionInput,
    );
    return new Response(result, {
      status: result.success ? 200 : result.status,
    });
  },
  httpRouteTriggerSettings: {
    path: '/studio/sessions/cancel',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
