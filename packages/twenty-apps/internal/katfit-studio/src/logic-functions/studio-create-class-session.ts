import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import {
  createClassSession,
  type CreateClassSessionInput,
} from 'src/logic-functions/handlers/create-class-session-handler';

export default defineLogicFunction({
  universalIdentifier: '269c7084-8c71-4c24-8692-8b689473a224',
  name: 'studio-create-class-session',
  description:
    'Create a future or historical session with optional package-backed participants and required audit events',
  timeoutSeconds: 30,
  handler: async (payload: RoutePayload<CreateClassSessionInput>) => {
    try {
      const result = await createClassSession(
        (payload.body ?? {}) as CreateClassSessionInput,
      );
      return new Response(result, {
        status: result.success ? 200 : result.status,
      });
    } catch {
      return new Response(
        {
          success: false,
          code: 'SESSION_CREATE_UNCONFIRMED',
          message:
          'Создание тренировки, добавление участников или журнал не подтверждены. Проверьте CRM и повторите с прежним ключом.',
        },
        { status: 500 },
      );
    }
  },
  httpRouteTriggerSettings: {
    path: '/studio/sessions/create',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
