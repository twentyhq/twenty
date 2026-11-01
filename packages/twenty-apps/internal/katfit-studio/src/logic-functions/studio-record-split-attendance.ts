import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';
import { recordGuardedSplitAttendance } from 'src/logic-functions/handlers/record-guarded-split-attendance-handler';
import { type RecordSplitAttendanceInput } from 'src/logic-functions/utils/split-attendance';

export default defineLogicFunction({
  universalIdentifier: 'c2afbb7b-7cc1-4852-8f1d-99d174e76f0e', name: 'studio-record-split-attendance', description: 'Mark both split participants attended and consume one shared visit', timeoutSeconds: 30,
  handler: async (routePayload: RoutePayload<RecordSplitAttendanceInput>) => {
    const result = await recordGuardedSplitAttendance((routePayload.body ?? {}) as RecordSplitAttendanceInput);
    return new Response(result, { status: result.success ? 200 : result.status });
  },
  httpRouteTriggerSettings: { path: '/studio/split-attendance/record', httpMethod: 'POST', isAuthRequired: true },
});
