import { isUndefined } from '@sniptt/guards';

import { type CalendarEventRecordingParticipant } from 'src/front-components/types/calendar-event-recording-participant.type';
import { type CalendarEventParticipantBySpeakerName } from 'src/front-components/utils/build-calendar-event-participant-by-speaker-name.util';
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
