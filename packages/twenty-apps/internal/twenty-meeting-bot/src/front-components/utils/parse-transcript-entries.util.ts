import { isArray, isNumber, isUndefined } from '@sniptt/guards';

import { type TranscriptEntry } from 'src/front-components/types/transcript-entry.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type TranscriptWord = {
  text: string;
  startSeconds: number | undefined;
};

const readTranscriptWord = (word: unknown): TranscriptWord | undefined => {
  const candidate = asRecord(word);

  if (isUndefined(candidate) || !isNonEmptyString(candidate.text)) {
    return undefined;
  }

  const relative = asRecord(candidate.start_timestamp)?.relative;

  return {
    text: candidate.text.trim(),
    startSeconds:
      isNumber(relative) && Number.isFinite(relative) ? relative : undefined,
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
    text: words.map((word) => word.text).join(' '),
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
