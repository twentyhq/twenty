import { CoreApiClient } from 'twenty-client-sdk/core';

import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { ensureRecallBot } from 'src/logic-functions/utils/ensure-recall-bot.util';
import { fetchCalendarEventsByIds } from 'src/logic-functions/utils/fetch-calendar-events-by-ids.util';
import { findOpenScheduledCallRecordings } from 'src/logic-functions/utils/find-open-scheduled-call-recordings.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export type HealCallRecordingsMissingRecallBotResult = {
  scheduledCallRecordingIds: string[];
};

// Closes the create-winner crash gap: a run that inserted the row but died before POSTing leaves a botless recording, and the cron is the single writer that re-POSTs it.
export const healCallRecordingsMissingRecallBot = async ({
  client,
  now,
}: {
  client: CoreApiClient;
  now: Date;
}): Promise<HealCallRecordingsMissingRecallBotResult> => {
  const botlessCallRecordings = (
    await findOpenScheduledCallRecordings(client)
  ).filter((callRecording) => !isNonEmptyString(callRecording.externalBotId));

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
    const calendarEvent = isNonEmptyString(callRecording.calendarEventId)
      ? calendarEventsById.get(callRecording.calendarEventId)
      : undefined;

    if (
      calendarEvent === undefined ||
      hasMeetingEnded({ calendarEvent, now })
    ) {
      continue;
    }

    await ensureRecallBot(client, { callRecording, calendarEvent });
    scheduledCallRecordingIds.push(callRecording.id);
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

  if (reference === null) {
    return false;
  }

  const referenceTime = new Date(reference).getTime();

  return !Number.isNaN(referenceTime) && referenceTime <= now.getTime();
};
