import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type MeetConferenceRecord } from 'src/logic-functions/types/meet-conference-record.type';
import { type MeetParticipant } from 'src/logic-functions/types/meet-participant.type';
import { type MeetTranscriptEntry } from 'src/logic-functions/types/meet-transcript-entry.type';
import { type TranscriptEntry } from 'src/logic-functions/types/transcript-entry.type';
import { getMeetParticipantDisplayName } from 'src/logic-functions/utils/get-meet-participant-display-name.util';

export const mapMeetTranscriptEntries = ({
  conferenceRecord,
  participants,
  transcriptEntries,
}: {
  conferenceRecord: Pick<MeetConferenceRecord, 'startTime'>;
  participants: MeetParticipant[];
  transcriptEntries: Pick<
    MeetTranscriptEntry,
    'participant' | 'text' | 'startTime'
  >[];
}): TranscriptEntry[] => {
  const conferenceStartMilliseconds = Date.parse(conferenceRecord.startTime);
  const displayNameByParticipantName = new Map(
    participants.map((participant) => [
      participant.name,
      getMeetParticipantDisplayName(participant),
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
