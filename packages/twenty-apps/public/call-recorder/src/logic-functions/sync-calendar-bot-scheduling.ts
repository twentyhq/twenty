import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import {
  SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SYNC_CALENDAR_BOT_SCHEDULING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { SYNC_CALENDAR_BOT_SCHEDULING_ROUTE_PATH } from 'src/constants/sync-calendar-bot-scheduling-route-path';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import { findOpenScheduledCallRecordings } from 'src/logic-functions/data/find-open-scheduled-call-recordings.util';
import { cancelCallRecordingRequest } from 'src/logic-functions/flows/cancel-call-recording-request.util';
import { isCalendarBotSchedulingEnabled } from 'src/logic-functions/utils/is-calendar-bot-scheduling-enabled.util';

export type SyncCalendarBotSchedulingResult =
  | { outcome: 'sweep-enqueued' }
  | {
      outcome: 'scheduled-bots-canceled';
      canceledCallRecordingIds: string[];
      failedCallRecordingIds: string[];
    };

// Called by the settings toggle right after the application variable is
// saved; the variable itself is the source of truth, so the direction is
// read here rather than trusted from the request body.
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
    const canceledCallRecordingIds: string[] = [];
    const failedCallRecordingIds: string[] = [];

    for (const callRecording of openCallRecordings) {
      try {
        await cancelCallRecordingRequest({ client, callRecording });
        canceledCallRecordingIds.push(callRecording.id);
      } catch (error) {
        console.error(
          `[call-recorder] failed to cancel scheduled callRecording ${callRecording.id} after calendar bot scheduling was turned off: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        failedCallRecordingIds.push(callRecording.id);
      }
    }

    return {
      outcome: 'scheduled-bots-canceled',
      canceledCallRecordingIds,
      failedCallRecordingIds,
    };
  };

export default defineLogicFunction({
  universalIdentifier:
    SYNC_CALENDAR_BOT_SCHEDULING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'sync-calendar-bot-scheduling',
  description:
    'Applies the calendar bot scheduling setting: cancels every scheduled recording bot when it is off, or sweeps upcoming meetings to schedule bots when it is back on.',
  timeoutSeconds: 900,
  handler: syncCalendarBotSchedulingHandler,
  httpRouteTriggerSettings: {
    path: SYNC_CALENDAR_BOT_SCHEDULING_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
