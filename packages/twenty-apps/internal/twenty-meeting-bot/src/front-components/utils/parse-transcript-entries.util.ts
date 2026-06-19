import { isArray, isNumber, isUndefined } from '@sniptt/guards';

import {
  type TranscriptEntry,
  type TranscriptWord,
} from 'src/front-components/types/transcript-entry.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const readRelativeTimestamp = (timestamp: unknown): number | undefined => {
  const relativeTimestamp = asRecord(timestamp)?.relative;

  return isNumber(relativeTimestamp) && Number.isFinite(relativeTimestamp)
    ? relativeTimestamp
    : undefined;
};

const readTranscriptWord = (word: unknown): TranscriptWord | undefined => {
  const candidate = asRecord(word);

  if (isUndefined(candidate) || !isNonEmptyString(candidate.text)) {
    return undefined;
  }

  return {
    text: candidate.text.trim(),
    startSeconds: readRelativeTimestamp(candidate.start_timestamp),
    endSeconds: readRelativeTimestamp(candidate.end_timestamp),
  };
};

const readSpeakerName = (participant: unknown): string => {
  const name = asRecord(participant)?.name;

  return isNonEmptyString(name) ? name.trim() : 'Unknown speaker';
};

const readTranscriptEntry = (entry: unknown): TranscriptEntry | undefined => {
  const candidate = asRecord(entry);

  if (isUndefined(candidate) || !isArray(candidate.words)) {
    return undefined;
  }

  const words = candidate.words
    .map(readTranscriptWord)
    .filter((word): word is TranscriptWord => !isUndefined(word));

  if (words.length === 0) {
    return undefined;
  }

  return {
    speakerName: readSpeakerName(candidate.participant),
    startSeconds: words[0].startSeconds,
    endSeconds: words[words.length - 1].endSeconds,
    text: words.map((word) => word.text).join(' '),
    words,
  };
};

// Undefined means the value is not a diarized transcript; malformed entries are skipped, not fatal.
export const parseTranscriptEntries = (
  transcript: unknown,
): TranscriptEntry[] | undefined => {
  if (!isArray(transcript)) {
    return undefined;
  }

  return transcript
    .map(readTranscriptEntry)
    .filter((entry): entry is TranscriptEntry => !isUndefined(entry));
};
