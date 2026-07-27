import { isUndefined } from '@sniptt/guards';

import { type CalendarEventRecordingParticipant } from 'src/front-components/types/calendar-event-recording-participant.type';
import { type TranscriptEntry } from 'src/front-components/types/transcript-entry.type';
import { buildCalendarEventParticipantBySpeakerName } from 'src/front-components/utils/build-calendar-event-participant-by-speaker-name.util';
import { getCalendarEventParticipantForSpeakerName } from 'src/front-components/utils/get-calendar-event-participant-for-speaker-name.util';
import { formatSecondsAsClockTimestamp } from 'src/logic-functions/utils/format-seconds-as-clock-timestamp.util';

// Mirrors the on-screen transcript: participant display name resolution wins
// over the raw diarized speaker label so the copied text matches what is read.
export const buildTranscriptPlainText = ({
  entries,
  calendarEventParticipants,
}: {
  entries: TranscriptEntry[];
  calendarEventParticipants: CalendarEventRecordingParticipant[];
}): string => {
  const calendarEventParticipantBySpeakerName =
    buildCalendarEventParticipantBySpeakerName(calendarEventParticipants);

  return entries
    .map((entry) => {
      const calendarEventParticipant =
        getCalendarEventParticipantForSpeakerName({
          speakerName: entry.speakerName,
          calendarEventParticipantBySpeakerName,
        });
      const speakerDisplayName =
        calendarEventParticipant?.displayName ?? entry.speakerName;
      const timestamp = isUndefined(entry.startSeconds)
        ? ''
        : ` (${formatSecondsAsClockTimestamp(entry.startSeconds)})`;

      return `${speakerDisplayName}${timestamp}\n${entry.text}`;
    })
    .join('\n\n');
};
