import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type GoogleMeetConferenceRecord } from 'src/logic-functions/types/google-meet-conference-record.type';
import { type GoogleMeetParticipant } from 'src/logic-functions/types/google-meet-participant.type';
import { type GoogleMeetTranscriptEntry } from 'src/logic-functions/types/google-meet-transcript-entry.type';
import { type TranscriptEntry } from 'src/logic-functions/types/transcript-entry.type';
import { getGoogleMeetParticipantDisplayName } from 'src/logic-functions/utils/get-google-meet-participant-display-name.util';

export const mapGoogleMeetTranscriptEntries = ({
  conferenceRecord,
  participants,
  transcriptEntries,
}: {
  conferenceRecord: Pick<GoogleMeetConferenceRecord, 'startTime'>;
  participants: GoogleMeetParticipant[];
  transcriptEntries: Pick<
    GoogleMeetTranscriptEntry,
    'participant' | 'text' | 'startTime'
  >[];
}): TranscriptEntry[] => {
  const conferenceStartMilliseconds = Date.parse(conferenceRecord.startTime);
  const displayNameByParticipantName = new Map(
    participants.map((participant) => [
      participant.name,
      getGoogleMeetParticipantDisplayName(participant),
    ]),
  );

  return transcriptEntries
    .flatMap(({ participant, text, startTime }) => {
      const trimmedText = text?.trim();
      const startMilliseconds = Date.parse(startTime ?? '');

      if (!isNonEmptyString(trimmedText) || Number.isNaN(startMilliseconds)) {
        return [];
      }

      return [
        { participantName: participant, text: trimmedText, startMilliseconds },
      ];
    })
    .sort(
      (firstEntry, secondEntry) =>
        firstEntry.startMilliseconds - secondEntry.startMilliseconds,
    )
    .map(({ participantName, text, startMilliseconds }) => ({
      participant: {
        name: isDefined(participantName)
          ? (displayNameByParticipantName.get(participantName) ?? null)
          : null,
      },
      words: [
        {
          text,
          start_timestamp: {
            relative:
              Math.max(startMilliseconds - conferenceStartMilliseconds, 0) /
              1_000,
          },
        },
      ],
    }));
};
