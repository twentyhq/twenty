import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { enqueuePendingCallRecordingRecoveryJobs } from 'src/logic-functions/data/enqueue-pending-call-recording-recovery-jobs.util';
import { hasMeetingEnded } from 'src/logic-functions/domain/has-meeting-ended.util';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { findOpenScheduledCallRecordings } from 'src/logic-functions/data/find-open-scheduled-call-recordings.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';

export const BOT_NEVER_SCHEDULED_FAILURE_REASON = 'bot_never_scheduled';
export const BOT_SCHEDULE_OUTCOME_UNKNOWN_FAILURE_REASON =
  'bot_schedule_outcome_unknown';

// Mirrors the stale-state convergence lookback: past it no automatic pull
// pass will resolve the row anymore, so keeping it pending only wastes runs.
const UNRESOLVED_ATTEMPT_MAX_AGE_DAYS = 7;

export type EnqueuePendingCallRecordingRecoveriesResult = {
  enqueuedCallRecordingIds: string[];
  markedFailedCallRecordingIds: string[];
};

export const enqueuePendingCallRecordingRecoveries = async ({
  client,
  now,
}: {
  client: CoreApiClient;
  now: Date;
}): Promise<EnqueuePendingCallRecordingRecoveriesResult> => {
  const result: EnqueuePendingCallRecordingRecoveriesResult = {
    enqueuedCallRecordingIds: [],
    markedFailedCallRecordingIds: [],
  };
  const pendingCallRecordings = (
    await findOpenScheduledCallRecordings(client)
  ).filter((callRecording) => isUndefined(callRecording.externalBotId));

  if (pendingCallRecordings.length === 0) {
    return result;
  }

  const calendarEventsById = new Map(
    (
      await fetchCalendarEventsByIds(
        client,
        getUniqueSortedIds(
          pendingCallRecordings.map(
            (callRecording) => callRecording.calendarEventId,
          ),
        ),
      )
    ).map((calendarEvent) => [calendarEvent.id, calendarEvent]),
  );

  for (const callRecording of pendingCallRecordings) {
    const calendarEvent = isUndefined(callRecording.calendarEventId)
      ? undefined
      : calendarEventsById.get(callRecording.calendarEventId);

    if (isUndefined(calendarEvent)) {
      continue;
    }

    if (
      hasMeetingEnded({
        startsAt: calendarEvent.startsAt,
        endsAt: calendarEvent.endsAt,
        now,
      })
    ) {
      await resolveEndedPendingCallRecording({
        client,
        callRecording,
        calendarEvent,
        now,
        result,
      });
      continue;
    }

    result.enqueuedCallRecordingIds.push(callRecording.id);
  }

  await enqueuePendingCallRecordingRecoveryJobs({
    callRecordingIds: result.enqueuedCallRecordingIds,
    recoveryDate: now.toISOString().slice(0, 10),
  });

  return result;
};

// Only an absent attempt marker proves no POST reached Recall; a marked row
// may have a bot that joined and recorded before the id write-back was lost,
// so it keeps its recovery chance until the convergence lookback has passed.
const resolveEndedPendingCallRecording = async ({
  client,
  callRecording,
  calendarEvent,
  now,
  result,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord;
  now: Date;
  result: EnqueuePendingCallRecordingRecoveriesResult;
}): Promise<void> => {
  if (isUndefined(callRecording.botScheduleAttemptedAt)) {
    await markCallRecordingFailed({
      client,
      callRecording,
      failureReason: BOT_NEVER_SCHEDULED_FAILURE_REASON,
      logMessage: `call recording ${callRecording.id} never got a Recall bot and its meeting has ended; marking it failed`,
    });
    result.markedFailedCallRecordingIds.push(callRecording.id);

    return;
  }

  if (!hasUnresolvedAttemptAgedOut({ calendarEvent, now })) {
    console.warn(
      `[call-recorder] call recording ${callRecording.id} has an unresolved Recall bot creation attempt and its meeting has ended; waiting for convergence`,
    );

    return;
  }

  await markCallRecordingFailed({
    client,
    callRecording,
    failureReason: BOT_SCHEDULE_OUTCOME_UNKNOWN_FAILURE_REASON,
    logMessage: `call recording ${callRecording.id} has an unresolved Recall bot creation attempt older than the convergence lookback; marking it failed`,
  });
  result.markedFailedCallRecordingIds.push(callRecording.id);
};

const hasUnresolvedAttemptAgedOut = ({
  calendarEvent,
  now,
}: {
  calendarEvent: CalendarEventRecord;
  now: Date;
}): boolean => {
  // Mirrors hasMeetingEnded: an unparseable end time falls back to the start
  // time so these rows still age out of the pending sweep eventually.
  const meetingEndTime = [calendarEvent.endsAt, calendarEvent.startsAt]
    .filter((candidate) => !isUndefined(candidate))
    .map((candidate) => new Date(candidate).getTime())
    .find((candidateTime) => !Number.isNaN(candidateTime));

  return (
    !isUndefined(meetingEndTime) &&
    meetingEndTime + UNRESOLVED_ATTEMPT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000 <=
      now.getTime()
  );
};

const markCallRecordingFailed = async ({
  client,
  callRecording,
  failureReason,
  logMessage,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingRecord;
  failureReason: string;
  logMessage: string;
}): Promise<void> => {
  console.warn(`[call-recorder] ${logMessage}`);

  await updateCallRecording(client, {
    id: callRecording.id,
    data: {
      status: CallRecordingStatus.FAILED,
      callRecorderFailureReason: failureReason,
    },
  });
};
