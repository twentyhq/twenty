import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CALENDAR_EVENT_UPDATE_BATCH_SIZE } from 'src/logic-functions/constants/calendar-event-update-batch-size';
import { clearCallRecorderPreferences } from 'src/logic-functions/data/clear-call-recorder-preferences.util';
import { fetchEndedCalendarEventIdsWithDefaultPreference } from 'src/logic-functions/data/fetch-ended-calendar-event-ids-with-default-preference.util';
import { findCallRecordingsByCalendarEventIds } from 'src/logic-functions/data/find-call-recordings-by-calendar-event-ids.util';
import { hasCallRecordingAttempt } from 'src/logic-functions/domain/has-call-recording-attempt.util';
import { getBatches } from 'src/logic-functions/utils/get-batches.util';

export type ClearStaleCallRecorderPreferencesResult = {
  endedCalendarEventCount: number;
  clearedCalendarEventCount: number;
};

// Past meetings mostly age out without any calendar change, so nothing
// event-driven ever revisits them; this pass clears the default ON they keep.
export const clearStaleCallRecorderPreferences = async ({
  client,
  now,
}: {
  client: CoreApiClient;
  now: Date;
}): Promise<ClearStaleCallRecorderPreferencesResult> => {
  const endedCalendarEventIds =
    await fetchEndedCalendarEventIdsWithDefaultPreference(client, now);
  let clearedCalendarEventCount = 0;

  for (const calendarEventIdBatch of getBatches(
    endedCalendarEventIds,
    CALENDAR_EVENT_UPDATE_BATCH_SIZE,
  )) {
    const callRecordings = await findCallRecordingsByCalendarEventIds(
      client,
      calendarEventIdBatch,
    );
    const attemptedCalendarEventIds = new Set(
      callRecordings
        .filter((callRecording) => hasCallRecordingAttempt([callRecording]))
        .map((callRecording) => callRecording.calendarEventId),
    );

    clearedCalendarEventCount += await clearCallRecorderPreferences(
      client,
      calendarEventIdBatch.filter(
        (calendarEventId) => !attemptedCalendarEventIds.has(calendarEventId),
      ),
    );
  }

  return {
    endedCalendarEventCount: endedCalendarEventIds.length,
    clearedCalendarEventCount,
  };
};
