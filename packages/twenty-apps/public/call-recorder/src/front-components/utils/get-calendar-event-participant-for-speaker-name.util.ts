import { isUndefined } from '@sniptt/guards';

import { type CalendarEventParticipantBySpeakerName } from 'src/front-components/types/calendar-event-participant-by-speaker-name.type';
import { type CalendarEventRecordingParticipant } from 'src/front-components/types/calendar-event-recording-participant.type';
import { getSpeakerNameMatchKeys } from 'src/front-components/utils/get-speaker-name-match-keys.util';

export const getCalendarEventParticipantForSpeakerName = ({
  speakerName,
  calendarEventParticipantBySpeakerName,
}: {
  speakerName: string;
  calendarEventParticipantBySpeakerName: CalendarEventParticipantBySpeakerName;
}): CalendarEventRecordingParticipant | undefined => {
  for (const speakerNameMatchKey of getSpeakerNameMatchKeys(speakerName)) {
    const calendarEventParticipant =
      calendarEventParticipantBySpeakerName.get(speakerNameMatchKey);

    if (!isUndefined(calendarEventParticipant)) {
      return calendarEventParticipant;
    }
  }

  return undefined;
};
