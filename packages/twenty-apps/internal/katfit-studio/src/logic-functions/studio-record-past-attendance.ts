import { runAuditedStudioCommand } from 'src/logic-functions/utils/studio-command-audit';
import { runWithStudioScheduleGuard } from 'src/logic-functions/utils/studio-schedule-guard';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { recordGuardedPastAttendance } from 'src/logic-functions/handlers/record-guarded-past-attendance-handler';
import { type RecordPastAttendanceInput } from 'src/logic-functions/utils/past-attendance';

const handler = async (
  routePayload: RoutePayload<RecordPastAttendanceInput>,
  context: { userWorkspaceId: string | null },
): Promise<Response> => {
  const input = (routePayload.body ?? {}) as RecordPastAttendanceInput;
  const result = await runAuditedStudioCommand(
    'studio-record-past-attendance',
    input,
    () =>
      runWithStudioScheduleGuard(
        input.existingClassSessionId
          ? { kind: 'existing' }
          : {
              kind: 'create',
              recordingKey: `past-attendance-session:${String(input.idempotencyKey ?? '').trim()}`,
              startsAt: input.startsAt,
              endsAt: input.endsAt,
            },
        () => recordGuardedPastAttendance(input, context),
      ),
    undefined,
    context,
  );
  return new Response(result, { status: result.success ? 200 : result.status });
};

export default defineLogicFunction({
  universalIdentifier: '8d033b79-d0e8-4aa3-aae0-796c995eff70',
  name: 'studio-record-past-attendance',
  description:
    'Record a completed class and consume one visit from a paid package',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/studio/attendance/record-past',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
