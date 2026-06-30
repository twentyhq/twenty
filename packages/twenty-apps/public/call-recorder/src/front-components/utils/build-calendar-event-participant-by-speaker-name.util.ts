import { isUndefined } from '@sniptt/guards';

import { type CalendarEventParticipantBySpeakerName } from 'src/front-components/types/calendar-event-participant-by-speaker-name.type';
import { type CalendarEventRecordingParticipant } from 'src/front-components/types/calendar-event-recording-participant.type';
import { getSpeakerNameMatchKeys } from 'src/front-components/utils/get-speaker-name-match-keys.util';

export const buildCalendarEventParticipantBySpeakerName = (
  calendarEventParticipants: CalendarEventRecordingParticipant[],
): CalendarEventParticipantBySpeakerName => {
  const calendarEventParticipantBySpeakerName: CalendarEventParticipantBySpeakerName =
    new Map();
  const ambiguousSpeakerNameMatchKeys = new Set<string>();

  for (const calendarEventParticipant of calendarEventParticipants) {
    for (const nameCandidate of calendarEventParticipant.nameCandidates) {
      const speakerNameMatchKeys = getSpeakerNameMatchKeys(nameCandidate);

      for (const speakerNameMatchKey of speakerNameMatchKeys) {
        const matchingCalendarEventParticipant =
          calendarEventParticipantBySpeakerName.get(speakerNameMatchKey);

        if (ambiguousSpeakerNameMatchKeys.has(speakerNameMatchKey)) {
          continue;
        }

        if (isUndefined(matchingCalendarEventParticipant)) {
          calendarEventParticipantBySpeakerName.set(
            speakerNameMatchKey,
            calendarEventParticipant,
          );
          continue;
        }

        if (
          matchingCalendarEventParticipant.id !== calendarEventParticipant.id
        ) {
          calendarEventParticipantBySpeakerName.delete(speakerNameMatchKey);
          ambiguousSpeakerNameMatchKeys.add(speakerNameMatchKey);
        }
      }
    }
  }

  return calendarEventParticipantBySpeakerName;
};
