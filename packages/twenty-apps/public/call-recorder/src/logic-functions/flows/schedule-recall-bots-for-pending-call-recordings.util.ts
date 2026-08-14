import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { canRescheduleCallRecordingWithoutRecallLookup } from 'src/logic-functions/domain/can-reschedule-call-recording-without-recall-lookup.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { hasMeetingEnded } from 'src/logic-functions/domain/has-meeting-ended.util';
import { recoverAmbiguousCallRecordingScheduleAttempts } from 'src/logic-functions/flows/recover-ambiguous-call-recording-schedule-attempts.util';
import { resolveEndedPendingCallRecording } from 'src/logic-functions/flows/resolve-ended-pending-call-recording.util';
import { scheduleRecallBotForCallRecording } from 'src/logic-functions/flows/schedule-recall-bot-for-call-recording.util';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { findOpenScheduledCallRecordings } from 'src/logic-functions/data/find-open-scheduled-call-recordings.util';
import { findScheduledRecallBotsByCallRecordingId } from 'src/logic-functions/recall-api/find-scheduled-recall-bots-by-call-recording-id.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { type ScheduleRecallBotsForPendingCallRecordingsResult } from 'src/logic-functions/types/schedule-recall-bots-for-pending-call-recordings-result.type';

type ResumableCallRecording = {
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord;
};

// Resumes a CallRecording inserted before its Recall bot was scheduled.
export const scheduleRecallBotsForPendingCallRecordings = async ({
  client,
  now,
}: {
  client: CoreApiClient;
  now: Date;
}): Promise<ScheduleRecallBotsForPendingCallRecordingsResult> => {
  const result: ScheduleRecallBotsForPendingCallRecordingsResult = {
    attachedCallRecordingIds: [],
    scheduledCallRecordingIds: [],
    markedFailedCallRecordingIds: [],
    failedCallRecordingIds: [],
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
  const resumableCallRecordings: ResumableCallRecording[] = [];

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
      const didMarkCallRecordingFailed = await resolveEndedPendingCallRecording(
        {
          client,
          callRecording,
          calendarEvent,
          now,
        },
      );

      if (didMarkCallRecordingFailed) {
        result.markedFailedCallRecordingIds.push(callRecording.id);
      }
      continue;
    }

    resumableCallRecordings.push({ callRecording, calendarEvent });
  }

  if (resumableCallRecordings.length === 0) {
    return result;
  }

  // Rows without a schedule-attempt marker never reached Recall, so no bot
  // can exist for them. Rows whose stored idempotency key still matches the
  // current scheduling inputs can re-send the creation and let Recall dedupe
  // it. Only attempts whose inputs drifted since the attempt pay for a
  // Recall lookup.
  const workspaceId = getCurrentWorkspaceId();
  const ambiguousCallRecordings = resumableCallRecordings.filter(
    ({ callRecording, calendarEvent }) =>
      !canRescheduleCallRecordingWithoutRecallLookup({
        callRecording,
        calendarEvent,
        workspaceId,
        now,
      }),
  );
  const unambiguousCallRecordings = resumableCallRecordings.filter(
    ({ callRecording, calendarEvent }) =>
      canRescheduleCallRecordingWithoutRecallLookup({
        callRecording,
        calendarEvent,
        workspaceId,
        now,
      }),
  );

  for (const { callRecording, calendarEvent } of unambiguousCallRecordings) {
    await scheduleBotForResumableCallRecordingSafely({
      client,
      callRecording,
      calendarEvent,
      result,
    });
  }

  if (ambiguousCallRecordings.length === 0) {
    return result;
  }

  // A run that POSTed a bot but died before the id write-back leaves the bot
  // claimable by metadata; one workspace-wide lookup finds them all without a
  // per-recording list call.
  const lookupResult = await findScheduledRecallBotsByCallRecordingId();

  // A failed lookup can hide existing bots; creating one now could duplicate
  // them, so defer to the next run.
  if (!lookupResult.ok) {
    return result;
  }

  const recoveryResult = await recoverAmbiguousCallRecordingScheduleAttempts({
    client,
    ambiguousCallRecordings,
    recallBotsByCallRecordingId: lookupResult.recallBotsByCallRecordingId,
    workspaceId,
  });
  result.attachedCallRecordingIds.push(
    ...recoveryResult.attachedCallRecordingIds,
  );
  result.scheduledCallRecordingIds.push(
    ...recoveryResult.scheduledCallRecordingIds,
  );
  result.failedCallRecordingIds.push(...recoveryResult.failedCallRecordingIds);

  return result;
};

const scheduleBotForResumableCallRecordingSafely = async ({
  client,
  callRecording,
  calendarEvent,
  result,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord;
  result: ScheduleRecallBotsForPendingCallRecordingsResult;
}): Promise<void> => {
  try {
    await scheduleBotForResumableCallRecording({
      client,
      callRecording,
      calendarEvent,
      result,
    });
  } catch (error) {
    recordCallRecordingScheduleFailure({
      callRecordingId: callRecording.id,
      error,
      result,
    });
  }
};

const recordCallRecordingScheduleFailure = ({
  callRecordingId,
  error,
  result,
}: {
  callRecordingId: string;
  error: unknown;
  result: ScheduleRecallBotsForPendingCallRecordingsResult;
}): void => {
  console.warn(
    `[call-recorder] failed to schedule Recall bot for callRecording ${callRecordingId}: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  result.failedCallRecordingIds.push(callRecordingId);
};

const scheduleBotForResumableCallRecording = async ({
  client,
  callRecording,
  calendarEvent,
  result,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord;
  result: ScheduleRecallBotsForPendingCallRecordingsResult;
}): Promise<void> => {
  const didScheduleRecallBot = await scheduleRecallBotForCallRecording(client, {
    callRecording,
    calendarEvent,
  });

  if (didScheduleRecallBot) {
    result.scheduledCallRecordingIds.push(callRecording.id);
  }
};
