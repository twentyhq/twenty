import { isArray, isNumber } from '@sniptt/guards';

import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const UNKNOWN_SPEAKER = 'Unknown speaker';

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

// Formats a relative offset in seconds as mm:ss (or h:mm:ss past an hour) so the
// agent can anchor its time-stamped notes, Fireflies-style.
const formatTimestamp = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((safeSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = safeSeconds % SECONDS_PER_MINUTE;
  const paddedSeconds = String(seconds).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${paddedSeconds}`;
  }

  return `${minutes}:${paddedSeconds}`;
};

// Reads the start offset of the entry from the first word that carries one.
const readEntryStartSeconds = (words: unknown[]): number | undefined => {
  for (const word of words) {
    const relative = asRecord(asRecord(word)?.start_timestamp)?.relative;

    if (isNumber(relative) && Number.isFinite(relative)) {
      return relative;
    }
  }

  return undefined;
};

// Flattens one diarized transcript entry into a "[mm:ss] Speaker: words" line,
// or undefined when the entry carries no usable text.
const buildTranscriptLine = (entry: unknown): string | undefined => {
  const record = asRecord(entry);

  if (record === undefined || !isArray(record.words)) {
    return undefined;
  }

  const text = record.words
    .map((word) => asRecord(word)?.text)
    .filter(isNonEmptyString)
    .map((word) => word.trim())
    .join(' ')
    .trim();

  if (!isNonEmptyString(text)) {
    return undefined;
  }

  const participantName = asRecord(record.participant)?.name;
  const speakerName = isNonEmptyString(participantName)
    ? participantName.trim()
    : UNKNOWN_SPEAKER;

  const startSeconds = readEntryStartSeconds(record.words);
  const timestamp =
    startSeconds === undefined ? '' : `[${formatTimestamp(startSeconds)}] `;

  return `${timestamp}${speakerName}: ${text}`;
};

// Turns the diarized transcript into the user prompt for the summarizer agent.
// Returns undefined when there is no usable dialogue to summarize.
export const buildCallRecordingSummaryPrompt = ({
  transcript,
  title,
}: {
  transcript: unknown;
  title?: string;
}): string | undefined => {
  if (!isArray(transcript)) {
    return undefined;
  }

  const lines = transcript.map(buildTranscriptLine).filter(isNonEmptyString);

  if (lines.length === 0) {
    return undefined;
  }

  const header = isNonEmptyString(title)
    ? `Meeting title: ${title.trim()}\n\n`
    : '';

  return `${header}Transcript:\n${lines.join('\n')}`;
};
