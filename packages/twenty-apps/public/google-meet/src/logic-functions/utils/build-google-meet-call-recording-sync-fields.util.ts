import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type CalendarEventCandidate } from 'src/logic-functions/types/calendar-event-candidate.type';
import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { type GoogleMeetConferenceRecord } from 'src/logic-functions/types/google-meet-conference-record.type';
import { type TranscriptEntry } from 'src/logic-functions/types/transcript-entry.type';

export const buildGoogleMeetCallRecordingSyncFields = ({
  conferenceRecord,
  title,
  summaryMarkdown,
  transcriptEntries,
  hasRecordingFile,
  calendarEvent,
}: {
  conferenceRecord: Pick<
    GoogleMeetConferenceRecord,
    'name' | 'startTime' | 'endTime'
  >;
  title: string | undefined;
  summaryMarkdown: string | undefined;
  transcriptEntries: TranscriptEntry[];
  hasRecordingFile: boolean;
  calendarEvent: Pick<CalendarEventCandidate, 'id'> | undefined;
}): CallRecordingSyncFields => {
  return {
    ...(isNonEmptyString(title) ? { title } : {}),
    status:
      isNonEmptyArray(transcriptEntries) ||
      isNonEmptyString(summaryMarkdown) ||
      hasRecordingFile
        ? 'COMPLETED'
        : 'PROCESSING',
    externalRecordingId: conferenceRecord.name,
    startedAt: conferenceRecord.startTime,
    ...(isNonEmptyString(conferenceRecord.endTime)
      ? { endedAt: conferenceRecord.endTime }
      : {}),
    ...(isNonEmptyArray(transcriptEntries)
      ? { transcript: transcriptEntries }
      : {}),
    ...(isNonEmptyString(summaryMarkdown)
      ? { summary: { blocknote: null, markdown: summaryMarkdown } }
      : {}),
    ...(isDefined(calendarEvent) ? { calendarEventId: calendarEvent.id } : {}),
  };
};
