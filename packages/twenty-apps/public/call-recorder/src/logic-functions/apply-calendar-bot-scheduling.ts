import { isNonEmptyString, isNumber, isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { enqueueJobs } from 'twenty-sdk/logic-function';

import {
  APPLY_CALENDAR_BOT_SCHEDULING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  CANCEL_SCHEDULED_RECALL_BOTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { cancelOpenScheduledCallRecordingRequests } from 'src/logic-functions/data/cancel-open-scheduled-call-recording-requests.util';
import { enqueueCallRecordingRequestFollowUps } from 'src/logic-functions/data/enqueue-call-recording-request-follow-ups.util';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import { findCallRecordingsByFilter } from 'src/logic-functions/data/find-call-recordings-by-filter.util';
import { CALENDAR_BOT_SCHEDULING_APPLY_RETRY_DELAYS_MS } from 'src/logic-functions/constants/calendar-bot-scheduling-apply-retry-delays-ms';
import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';
import { buildCalendarBotSchedulingApplyJob } from 'src/logic-functions/domain/build-calendar-bot-scheduling-apply-job.util';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { isCalendarBotSchedulingEnabled } from 'src/logic-functions/utils/is-calendar-bot-scheduling-enabled.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';
import { fetchWithRateLimitRetry } from 'src/logic-functions/utils/fetch-with-rate-limit-retry.util';

type ApplyCalendarBotSchedulingResult =
  | { outcome: 'sweep-enqueued' }
  | {
      outcome: 'scheduled-bots-canceled';
      canceledCallRecordingCount: number;
    };

const applyCalendarBotScheduling =
  async (): Promise<ApplyCalendarBotSchedulingResult> => {
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

const enqueueNextApplyAttempt = async ({
  attempt,
  applyJobId,
}: {
  attempt: number;
  applyJobId: string;
}): Promise<void> => {
  const retryDelayMs = CALENDAR_BOT_SCHEDULING_APPLY_RETRY_DELAYS_MS[attempt];

  if (isUndefined(retryDelayMs)) {
    return;
  }

  // Keyed to the originating window job so a redelivered attempt re-arms the same retry.
  try {
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        APPLY_CALENDAR_BOT_SCHEDULING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      jobs: [
        {
          jobId: `${applyJobId}-retry-${attempt + 1}`,
          payload: { attempt: attempt + 1, applyJobId },
        },
      ],
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs: retryDelayMs,
    });
  } catch (error) {
    throw buildRetryableStepFailure(
      'calendar bot scheduling apply retry enqueueing',
      error,
    );
  }
};

export const applyCalendarBotSchedulingHandler = async (
  payload: unknown,
): Promise<ApplyCalendarBotSchedulingResult> => {
  const attemptValue = asRecord(payload)?.attempt;
  const attempt = isNumber(attemptValue) ? attemptValue : 0;
  const applyJobIdValue = asRecord(payload)?.applyJobId;
  const applyJobId = isNonEmptyString(applyJobIdValue)
    ? applyJobIdValue
    : buildCalendarBotSchedulingApplyJob({ now: Date.now() }).jobId;

  try {
    return await applyCalendarBotScheduling();
  } catch (error) {
    await enqueueNextApplyAttempt({ attempt, applyJobId });

    throw buildRetryableStepFailure('calendar bot scheduling apply', error);
  }
};

export default defineLogicFunction({
  universalIdentifier:
    APPLY_CALENDAR_BOT_SCHEDULING_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'apply-calendar-bot-scheduling',
  description:
    'Applies the calendar bot scheduling setting as it stands when the job runs: cancels every open recording request and enqueues Recall bot cleanup when it is off, then sweeps upcoming meetings either way. Retries itself a few times, minutes apart, when it fails.',
  timeoutSeconds: 900,
  handler: applyCalendarBotSchedulingHandler,
});
