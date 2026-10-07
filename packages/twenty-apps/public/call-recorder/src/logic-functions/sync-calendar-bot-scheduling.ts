import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import {
  CANCEL_SCHEDULED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SYNC_CALENDAR_BOT_SCHEDULING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { SYNC_CALENDAR_BOT_SCHEDULING_ROUTE_PATH } from 'src/constants/sync-calendar-bot-scheduling-route-path';
import { cancelOpenScheduledCallRecordingRequests } from 'src/logic-functions/data/cancel-open-scheduled-call-recording-requests.util';
import { enqueueCallRecordingRequestFollowUps } from 'src/logic-functions/data/enqueue-call-recording-request-follow-ups.util';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import { findCallRecordingsByFilter } from 'src/logic-functions/data/find-call-recordings-by-filter.util';
import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';
import { isCalendarBotSchedulingEnabled } from 'src/logic-functions/utils/is-calendar-bot-scheduling-enabled.util';
import { fetchWithRateLimitRetry } from 'src/logic-functions/utils/fetch-with-rate-limit-retry.util';

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

    const client = new CoreApiClient({ fetch: fetchWithRateLimitRetry });
    // Include unfinished cancellations so a retry after an enqueue failure does not lose them.
    const callRecordings = await findCallRecordingsByFilter(client, {
      or: [
        {
          recordingRequestStatus: { eq: CallRecordingRequestStatus.REQUESTED },
          status: { eq: CallRecordingStatus.SCHEDULED },
        },
        {
          recordingRequestStatus: { eq: CallRecordingRequestStatus.CANCELED },
          status: { in: NON_TERMINAL_CALL_RECORDING_STATUSES },
          or: [
            { externalBotId: { is: 'NOT_NULL' } },
            { botScheduleAttemptedAt: { is: 'NOT_NULL' } },
          ],
        },
      ],
    });
    const openCallRecordingIds = callRecordings
      .filter(
        (callRecording) =>
          callRecording.recordingRequestStatus ===
          CallRecordingRequestStatus.REQUESTED,
      )
      .map((callRecording) => callRecording.id);

    try {
      const canceledCallRecordingCount =
        await cancelOpenScheduledCallRecordingRequests(
          client,
          openCallRecordingIds,
          () => true,
        );

      await enqueueLogicFunctionJobs({
        logicFunctionUniversalIdentifier:
          CANCEL_SCHEDULED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        payloads: [{}],
      });

      await enqueueLogicFunctionJobs({
        logicFunctionUniversalIdentifier:
          SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        payloads: [{}],
      });

      return { outcome: 'scheduled-bots-canceled', canceledCallRecordingCount };
    } finally {
      await enqueueCallRecordingRequestFollowUps({
        callRecordingIds: callRecordings.map(
          (callRecording) => callRecording.id,
        ),
      });
    }
  };

export default defineLogicFunction({
  universalIdentifier:
    SYNC_CALENDAR_BOT_SCHEDULING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'sync-calendar-bot-scheduling',
  description:
    'Applies the calendar bot scheduling setting: cancels every open recording request and enqueues Recall bot cleanup when it is off, then sweeps upcoming meetings either way.',
  timeoutSeconds: 900,
  handler: syncCalendarBotSchedulingHandler,
  httpRouteTriggerSettings: {
    path: SYNC_CALENDAR_BOT_SCHEDULING_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
