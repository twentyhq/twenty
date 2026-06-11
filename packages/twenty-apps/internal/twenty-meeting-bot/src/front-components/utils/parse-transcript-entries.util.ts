import { type TranscriptEntry } from 'src/front-components/types/transcript-entry.type';

type TranscriptWord = {
  text: string;
  startSeconds: number | null;
};

const readTranscriptWord = (word: unknown): TranscriptWord | null => {
  if (typeof word !== 'object' || word === null) {
    return null;
  }

  const candidate = word as Record<string, unknown>;

  if (typeof candidate.text !== 'string' || candidate.text.trim() === '') {
    return null;
  }

  const startTimestamp = candidate.start_timestamp as
    | Record<string, unknown>
    | null
    | undefined;
  const relative = startTimestamp?.relative;

  return {
    text: candidate.text.trim(),
    startSeconds:
      typeof relative === 'number' && Number.isFinite(relative)
        ? relative
        : null,
  };
};

const readSpeakerName = (participant: unknown): string => {
  if (typeof participant !== 'object' || participant === null) {
    return 'Unknown speaker';
  }

  const name = (participant as Record<string, unknown>).name;

  return typeof name === 'string' && name.trim() !== ''
    ? name.trim()
    : 'Unknown speaker';
};

const readTranscriptEntry = (entry: unknown): TranscriptEntry | null => {
  if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
    return null;
  }

  const candidate = entry as Record<string, unknown>;

  if (!Array.isArray(candidate.words)) {
    return null;
  }

  const words = candidate.words
    .map(readTranscriptWord)
    .filter((word): word is TranscriptWord => word !== null);

  if (words.length === 0) {
    return null;
  }

  return {
    speakerName: readSpeakerName(candidate.participant),
    startSeconds: words[0].startSeconds,
    text: words.map((word) => word.text).join(' '),
  };
};

// Null means the value is not a diarized transcript; malformed entries are skipped, not fatal.
export const parseTranscriptEntries = (
  transcript: unknown,
): TranscriptEntry[] | null => {
  if (!Array.isArray(transcript)) {
    return null;
  }

  return transcript
    .map(readTranscriptEntry)
    .filter((entry): entry is TranscriptEntry => entry !== null);
};
