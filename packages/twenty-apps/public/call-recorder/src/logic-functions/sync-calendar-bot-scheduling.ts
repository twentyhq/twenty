import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import {
  CANCEL_SCHEDULED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SYNC_CALENDAR_BOT_SCHEDULING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { SYNC_CALENDAR_BOT_SCHEDULING_ROUTE_PATH } from 'src/constants/sync-calendar-bot-scheduling-route-path';
import { cancelOpenScheduledCallRecordingRequests } from 'src/logic-functions/data/cancel-open-scheduled-call-recording-requests.util';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import { findOpenScheduledCallRecordings } from 'src/logic-functions/data/find-open-scheduled-call-recordings.util';
import { isCalendarBotSchedulingEnabled } from 'src/logic-functions/utils/is-calendar-bot-scheduling-enabled.util';

export type SyncCalendarBotSchedulingResult =
  | { outcome: 'sweep-enqueued' }
  | {
      outcome: 'scheduled-bots-canceled';
      canceledCallRecordingCount: number;
    };

export const syncCalendarBotSchedulingHandler =
  async (): Promise<SyncCalendarBotSchedulingResult> => {
    if (isCalendarBotSchedulingEnabled()) {
      await enqueueLogicFunctionJobs({
        logicFunctionUniversalIdentifier:
          SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        payloads: [{}],
      });

      return { outcome: 'sweep-enqueued' };
    }

    const client = new CoreApiClient();
    const openCallRecordings = await findOpenScheduledCallRecordings(client);

    // The request status is what stops a new bot being scheduled, so it is
    // flipped inline; deleting the bots is throttleable Recall work and runs as
    // a retryable job instead of blocking the settings toggle.
    const canceledCallRecordingCount =
      await cancelOpenScheduledCallRecordingRequests(
        client,
        openCallRecordings.map((callRecording) => callRecording.id),
        () => true,
      );

    await enqueueLogicFunctionJobs({
      logicFunctionUniversalIdentifier:
        CANCEL_SCHEDULED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [{}],
    });

    return { outcome: 'scheduled-bots-canceled', canceledCallRecordingCount };
  };

export default defineLogicFunction({
  universalIdentifier:
    SYNC_CALENDAR_BOT_SCHEDULING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'sync-calendar-bot-scheduling',
  description:
    'Applies the calendar bot scheduling setting: cancels every open recording request and enqueues Recall bot cleanup when it is off, or sweeps upcoming meetings when it is back on.',
  timeoutSeconds: 900,
  handler: syncCalendarBotSchedulingHandler,
  httpRouteTriggerSettings: {
    path: SYNC_CALENDAR_BOT_SCHEDULING_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
