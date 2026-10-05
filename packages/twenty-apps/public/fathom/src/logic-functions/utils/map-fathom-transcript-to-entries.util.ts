import { isNonEmptyString } from '@sniptt/guards';
import { type TranscriptItem } from 'fathom-typescript/sdk/models/shared';

import { type TranscriptEntry } from 'src/logic-functions/types/transcript-entry.type';
import { parseFathomTimestamp } from 'src/logic-functions/utils/parse-fathom-timestamp.util';

const UNKNOWN_SPEAKER_LABEL = 'Speaker';

export const mapFathomTranscriptToEntries = (
  transcript: TranscriptItem[] | null | undefined,
): TranscriptEntry[] => {
  if (!Array.isArray(transcript)) {
    return [];
  }

  return transcript.flatMap((transcriptItem) => {
    const text = transcriptItem.text.trim();

    if (!isNonEmptyString(text)) {
      return [];
    }

    const speakerName = transcriptItem.speaker.displayName.trim();
    const startTimestamp = parseFathomTimestamp(transcriptItem.timestamp);

    return [
      {
        participant: {
          name: isNonEmptyString(speakerName)
            ? speakerName
            : UNKNOWN_SPEAKER_LABEL,
        },
        words: [
          {
            text,
            ...(startTimestamp === undefined
              ? {}
              : { start_timestamp: { relative: startTimestamp } }),
          },
        ],
      },
    ];
  });
};
