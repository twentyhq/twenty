import { isArray, isNumber, isUndefined } from '@sniptt/guards';

import {
  type TranscriptEntry,
  type TranscriptWord,
} from 'src/front-components/types/transcript-entry.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type TranscriptRecord = NonNullable<ReturnType<typeof asRecord>>;

const isTranscriptRecord = (
  candidate: TranscriptRecord | undefined,
): candidate is TranscriptRecord => !isUndefined(candidate);

const readRelativeTimestamp = (
  timestamp: TranscriptRecord | undefined,
): number | undefined => {
  const relativeTimestamp = timestamp?.relative;

  return isNumber(relativeTimestamp) && Number.isFinite(relativeTimestamp)
    ? relativeTimestamp
    : undefined;
};

const readTranscriptWord = (
  candidate: TranscriptRecord,
): TranscriptWord | undefined => {
  if (!isNonEmptyString(candidate.text)) {
    return undefined;
  }

  return {
    text: candidate.text.trim(),
    startSeconds: readRelativeTimestamp(asRecord(candidate.start_timestamp)),
    endSeconds: readRelativeTimestamp(asRecord(candidate.end_timestamp)),
  };
};

const readSpeakerName = (
  participant: TranscriptRecord | undefined,
): string => {
  const name = participant?.name;

  return isNonEmptyString(name) ? name.trim() : 'Unknown speaker';
};

const readTranscriptEntry = (
  candidate: TranscriptRecord,
): TranscriptEntry | undefined => {
  if (!isArray(candidate.words)) {
    return undefined;
  }

  const words = candidate.words
    .map(asRecord)
    .filter(isTranscriptRecord)
    .map(readTranscriptWord)
    .filter((word): word is TranscriptWord => !isUndefined(word));

  if (words.length === 0) {
    return undefined;
  }

  return {
    speakerName: readSpeakerName(asRecord(candidate.participant)),
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
    .map(asRecord)
    .filter(isTranscriptRecord)
    .map(readTranscriptEntry)
    .filter((entry): entry is TranscriptEntry => !isUndefined(entry));
};
