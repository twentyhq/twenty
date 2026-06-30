import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { ensureCallRecorder } from 'src/logic-functions/flows/ensure-call-recorder.util';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { findOpenScheduledCallRecordings } from 'src/logic-functions/data/find-open-scheduled-call-recordings.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';

export type HealCallRecordingsMissingBotResult = {
  scheduledCallRecordingIds: string[];
};

// Closes the create-winner crash gap: a run that inserted the row but died before POSTing leaves a botless recording, and the cron is the single writer that re-POSTs it.
export const healCallRecordingsMissingBot = async ({
  client,
  now,
}: {
  client: CoreApiClient;
  now: Date;
}): Promise<HealCallRecordingsMissingBotResult> => {
  const botlessCallRecordings = (
    await findOpenScheduledCallRecordings(client)
  ).filter((callRecording) => isUndefined(callRecording.externalBotId));

  if (botlessCallRecordings.length === 0) {
    return { scheduledCallRecordingIds: [] };
  }

  const calendarEventsById = new Map(
    (
      await fetchCalendarEventsByIds(
        client,
        getUniqueSortedIds(
          botlessCallRecordings.map(
            (callRecording) => callRecording.calendarEventId,
          ),
        ),
      )
    ).map((calendarEvent) => [calendarEvent.id, calendarEvent]),
  );
  const scheduledCallRecordingIds: string[] = [];

  for (const callRecording of botlessCallRecordings) {
    const calendarEvent = isUndefined(callRecording.calendarEventId)
      ? undefined
      : calendarEventsById.get(callRecording.calendarEventId);

    if (isUndefined(calendarEvent) || hasMeetingEnded({ calendarEvent, now })) {
      continue;
    }

    const didScheduleCallRecorder = await ensureCallRecorder(client, {
      callRecording,
      calendarEvent,
    });

    if (didScheduleCallRecorder) {
      scheduledCallRecordingIds.push(callRecording.id);
    }
  }

  return { scheduledCallRecordingIds };
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
