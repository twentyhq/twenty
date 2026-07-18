import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { hasMeetingEnded } from 'src/logic-functions/domain/has-meeting-ended.util';
import { attachExistingRecallBotToCallRecording } from 'src/logic-functions/flows/attach-existing-recall-bot-to-call-recording.util';
import { scheduleRecallBotForCallRecording } from 'src/logic-functions/flows/schedule-recall-bot-for-call-recording.util';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { findOpenScheduledCallRecordings } from 'src/logic-functions/data/find-open-scheduled-call-recordings.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';

export const BOT_NEVER_SCHEDULED_FAILURE_REASON = 'bot_never_scheduled';

export type ScheduleRecallBotsForPendingCallRecordingsResult = {
  attachedCallRecordingIds: string[];
  scheduledCallRecordingIds: string[];
  markedFailedCallRecordingIds: string[];
};

// Resumes a CallRecording inserted before its Recall bot was scheduled.
export const scheduleRecallBotsForPendingCallRecordings = async ({
  client,
  now,
}: {
  client: CoreApiClient;
  now: Date;
}): Promise<ScheduleRecallBotsForPendingCallRecordingsResult> => {
  const pendingCallRecordings = (
    await findOpenScheduledCallRecordings(client)
  ).filter((callRecording) => isUndefined(callRecording.externalBotId));

  if (pendingCallRecordings.length === 0) {
    return {
      attachedCallRecordingIds: [],
      scheduledCallRecordingIds: [],
      markedFailedCallRecordingIds: [],
    };
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
  const attachedCallRecordingIds: string[] = [];
  const scheduledCallRecordingIds: string[] = [];
  const markedFailedCallRecordingIds: string[] = [];

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
      // No bot ever joined, so nothing was recorded; failing the row keeps the
      // pending set from re-fetching it on every run forever.
      await markCallRecordingFailedAsNeverScheduled(client, callRecording);
      markedFailedCallRecordingIds.push(callRecording.id);
      continue;
    }

    const attachResult = await attachExistingRecallBotToCallRecording(client, {
      callRecording,
    });

    if (attachResult.status === 'attached') {
      attachedCallRecordingIds.push(callRecording.id);
      continue;
    }

    // A failed lookup can hide an existing bot; creating one now could duplicate it, so defer to the next run.
    if (attachResult.status === 'lookup-failed') {
      continue;
    }

    const didScheduleRecallBot = await scheduleRecallBotForCallRecording(
      client,
      {
        callRecording,
        calendarEvent,
      },
    );

    if (didScheduleRecallBot) {
      scheduledCallRecordingIds.push(callRecording.id);
    }
  }

  return {
    attachedCallRecordingIds,
    scheduledCallRecordingIds,
    markedFailedCallRecordingIds,
  };
};

const markCallRecordingFailedAsNeverScheduled = async (
  client: CoreApiClient,
  callRecording: CallRecordingRecord,
): Promise<void> => {
  console.warn(
    `[call-recorder] call recording ${callRecording.id} never got a Recall bot and its meeting has ended; marking it failed`,
  );

  await updateCallRecording(client, {
    id: callRecording.id,
    data: {
      status: CallRecordingStatus.FAILED,
      callRecorderFailureReason: BOT_NEVER_SCHEDULED_FAILURE_REASON,
    },
  });
};
