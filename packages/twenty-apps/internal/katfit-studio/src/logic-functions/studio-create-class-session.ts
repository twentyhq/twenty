import { runAuditedStudioCommand } from 'src/logic-functions/utils/studio-command-audit';
import { runWithStudioScheduleGuard } from 'src/logic-functions/utils/studio-schedule-guard';
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
  timeoutSeconds: 60,
  handler: async (
    payload: RoutePayload<CreateClassSessionInput>,
    context: { userWorkspaceId: string | null },
  ) => {
    const input = (payload.body ?? {}) as CreateClassSessionInput;
    const end = Date.parse(input.startsAt) + input.durationMinutes * 60000;
    const result = await runAuditedStudioCommand(
      'studio-create-class-session',
      input,
      () =>
        runWithStudioScheduleGuard(
          {
            kind: 'create',
            recordingKey: `session-create:${String(input.idempotencyKey ?? '').trim()}`,
            startsAt: input.startsAt,
            endsAt: Number.isFinite(end) ? new Date(end).toISOString() : '',
          },
          () =>
            createClassSession(input, undefined, new Date(), {
              coordinateParticipants: true,
            }),
        ),
      undefined,
      context,
    );
    return new Response(result, {
      status: result.success ? 200 : result.status,
    });
  },
  httpRouteTriggerSettings: {
    path: '/studio/sessions/create',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
