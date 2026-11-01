import { runAuditedStudioCommand } from 'src/logic-functions/utils/studio-command-audit';
import { runWithStudioScheduleGuard } from 'src/logic-functions/utils/studio-schedule-guard';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import {
  updateClassSession,
  type UpdateClassSessionInput,
} from 'src/logic-functions/handlers/update-class-session-handler';

export default defineLogicFunction({
  universalIdentifier: '219b53a9-9a02-4e6b-bd67-f4da46628541',
  name: 'studio-update-session',
  description:
    'Conditionally update a future session under shared mutation ownership',
  timeoutSeconds: 30,
  handler: async (
    payload: RoutePayload<UpdateClassSessionInput>,
    context: { userWorkspaceId: string | null },
  ) => {
    const input = (payload.body ?? {}) as UpdateClassSessionInput;
    const result = await runAuditedStudioCommand(
      'studio-update-session',
      input,
      () =>
        runWithStudioScheduleGuard(
          {
            kind: 'update',
            classSessionId: input.classSessionId,
            startsAt: input.target?.startsAt,
            endsAt: input.target?.endsAt,
          },
          () => updateClassSession(input),
        ),
      undefined,
      context,
    );
    return new Response(result, {
      status: result.success ? 200 : result.status,
    });
  },
  httpRouteTriggerSettings: {
    path: '/studio/sessions/update',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
