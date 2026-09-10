import { isNonEmptyString } from '@sniptt/guards';

import { GRANOLA_UNKNOWN_SPEAKER_LABEL } from 'src/constants/granola-transcript.constant';
import { type GranolaNote } from 'src/logic-functions/types/granola-api.type';
import { type TranscriptEntry } from 'src/logic-functions/types/transcript-entry.type';

export const mapGranolaTranscriptToEntries = ({
  transcript,
  owner,
  startedAt,
}: Pick<GranolaNote, 'transcript' | 'owner'> & {
  startedAt: string;
}): TranscriptEntry[] => {
  const ownerName = owner.name?.trim();
  const ownerDisplayName = isNonEmptyString(ownerName)
    ? ownerName
    : owner.email.trim();

  return (transcript ?? []).flatMap((item) => {
    const text = item.text.trim();

    if (!isNonEmptyString(text)) {
      return [];
    }

    const ownerLabel =
      item.speaker.attribution === 'me' ? ownerDisplayName : undefined;
    const name =
      [
        item.speaker.name?.trim(),
        ownerLabel,
        item.speaker.diarization_label?.trim(),
      ].find(isNonEmptyString) ?? GRANOLA_UNKNOWN_SPEAKER_LABEL;

    return [
      {
        participant: { name },
        words: [
          {
            text,
            start_timestamp: {
              relative:
                (Date.parse(item.start_time) - Date.parse(startedAt)) / 1_000,
            },
          },
        ],
      },
    ];
  });
};
