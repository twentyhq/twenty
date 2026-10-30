import { defineLogicFunction } from 'twenty-sdk/define';
import { enqueueJobs } from 'twenty-sdk/logic-function';

import {
  APPLY_CALENDAR_BOT_SCHEDULING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SYNC_CALENDAR_BOT_SCHEDULING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { SYNC_CALENDAR_BOT_SCHEDULING_ROUTE_PATH } from 'src/constants/sync-calendar-bot-scheduling-route-path';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { buildCalendarBotSchedulingApplyJob } from 'src/logic-functions/domain/build-calendar-bot-scheduling-apply-job.util';

type SyncCalendarBotSchedulingResult = { outcome: 'apply-enqueued' };

export const syncCalendarBotSchedulingHandler =
  async (): Promise<SyncCalendarBotSchedulingResult> => {
    const { jobId, delayMs } = buildCalendarBotSchedulingApplyJob({
      now: Date.now(),
    });

    // The queue drops an id it still holds, so every toggle in a window shares one run.
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        APPLY_CALENDAR_BOT_SCHEDULING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      jobs: [{ jobId, payload: { applyJobId: jobId } }],
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs,
    });

    return { outcome: 'apply-enqueued' };
  };

export default defineLogicFunction({
  universalIdentifier:
    SYNC_CALENDAR_BOT_SCHEDULING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'sync-calendar-bot-scheduling',
  description:
    'Coalesces calendar bot scheduling setting changes into at most one apply run per workspace every 15 seconds, which acts on the setting as it stands when it runs.',
  timeoutSeconds: 30,
  handler: syncCalendarBotSchedulingHandler,
  httpRouteTriggerSettings: {
    path: SYNC_CALENDAR_BOT_SCHEDULING_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
