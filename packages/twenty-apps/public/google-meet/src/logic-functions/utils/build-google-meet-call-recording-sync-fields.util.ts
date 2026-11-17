import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type CalendarEventCandidate } from 'src/logic-functions/types/calendar-event-candidate.type';
import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { type GoogleMeetConferenceRecord } from 'src/logic-functions/types/google-meet-conference-record.type';
import { type TranscriptEntry } from 'src/logic-functions/types/transcript-entry.type';

export const buildGoogleMeetCallRecordingSyncFields = ({
  conferenceRecord,
  transcriptEntries,
  calendarEvent,
}: {
  conferenceRecord: Pick<
    GoogleMeetConferenceRecord,
    'name' | 'startTime' | 'endTime'
  >;
  transcriptEntries: TranscriptEntry[];
  calendarEvent: Pick<CalendarEventCandidate, 'id' | 'title'> | undefined;
}): CallRecordingSyncFields => {
  const title = calendarEvent?.title?.trim();

  return {
    ...(isNonEmptyString(title) ? { title } : {}),
    status: isNonEmptyArray(transcriptEntries) ? 'COMPLETED' : 'PROCESSING',
    externalRecordingId: conferenceRecord.name,
    startedAt: conferenceRecord.startTime,
    ...(isNonEmptyString(conferenceRecord.endTime)
      ? { endedAt: conferenceRecord.endTime }
      : {}),
    ...(isNonEmptyArray(transcriptEntries)
      ? { transcript: transcriptEntries }
      : {}),
    ...(isDefined(calendarEvent) ? { calendarEventId: calendarEvent.id } : {}),
  };
};
