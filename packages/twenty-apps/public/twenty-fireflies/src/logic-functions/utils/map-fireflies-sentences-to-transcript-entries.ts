import { isNonEmptyString } from '@sniptt/guards';

import { type FirefliesTranscriptSentence } from 'src/logic-functions/types/fireflies-transcript.type';

const UNKNOWN_SPEAKER_LABEL = 'Speaker';

export type TranscriptEntryWord = {
  text: string;
  start_timestamp?: { relative: number };
  end_timestamp?: { relative: number };
};

export type TranscriptEntry = {
  participant: { name: string };
  words: TranscriptEntryWord[];
};

const isFiniteNumber = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value);

// Fireflies only exposes sentence-level timing, so each sentence becomes a single-word entry.
export const mapFirefliesSentencesToTranscriptEntries = (
  sentences: FirefliesTranscriptSentence[] | null | undefined,
): TranscriptEntry[] => {
  if (!Array.isArray(sentences)) {
    return [];
  }

  return sentences.flatMap((sentence) => {
    const text = sentence.text?.trim();

    if (!isNonEmptyString(text)) {
      return [];
    }

    const speakerName = sentence.speaker_name?.trim();
    const startSeconds = sentence.start_time;
    // No end_time → leave end_timestamp unset so players span the entry
    // until the next timestamped sentence instead of a single instant.
    const endSeconds = sentence.end_time;

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
            ...(isFiniteNumber(startSeconds)
              ? { start_timestamp: { relative: startSeconds } }
              : {}),
            ...(isFiniteNumber(endSeconds)
              ? { end_timestamp: { relative: endSeconds } }
              : {}),
          },
        ],
      },
    ];
  });
};
