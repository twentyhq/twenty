import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { attachExistingRecallBotToCallRecording } from 'src/logic-functions/flows/attach-existing-recall-bot-to-call-recording.util';
import { scheduleRecallBotForCallRecording } from 'src/logic-functions/flows/schedule-recall-bot-for-call-recording.util';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { findOpenScheduledCallRecordings } from 'src/logic-functions/data/find-open-scheduled-call-recordings.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';

export type ScheduleRecallBotsForPendingCallRecordingsResult = {
  attachedCallRecordingIds: string[];
  scheduledCallRecordingIds: string[];
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
    return { attachedCallRecordingIds: [], scheduledCallRecordingIds: [] };
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

  for (const callRecording of pendingCallRecordings) {
    const calendarEvent = isUndefined(callRecording.calendarEventId)
      ? undefined
      : calendarEventsById.get(callRecording.calendarEventId);

    if (isUndefined(calendarEvent) || hasMeetingEnded({ calendarEvent, now })) {
      continue;
    }

    const attachResult = await attachExistingRecallBotToCallRecording(client, {
      callRecording,
      calendarEvent,
    });

    if (attachResult === 'attached') {
      attachedCallRecordingIds.push(callRecording.id);
      continue;
    }

    // A failed lookup can hide an existing bot; creating one now could duplicate it, so defer to the next run.
    if (attachResult === 'lookup-failed') {
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

  return { attachedCallRecordingIds, scheduledCallRecordingIds };
};

const hasMeetingEnded = ({
  calendarEvent,
  now,
}: {
  calendarEvent: CalendarEventRecord;
  now: Date;
}): boolean => {
  const reference = calendarEvent.endsAt ?? calendarEvent.startsAt;

  if (isUndefined(reference)) {
    return false;
  }

  const referenceTime = new Date(reference).getTime();

  return !Number.isNaN(referenceTime) && referenceTime <= now.getTime();
};
