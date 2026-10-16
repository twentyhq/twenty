import { isArray, isNonEmptyString, isNumber, isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

const UNKNOWN_SPEAKER = 'Unknown speaker';
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3_600;

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  isObject(value) && !isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const formatClockTimestamp = (totalSeconds: number): string => {
  const wholeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(wholeSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor(
    (wholeSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE,
  );
  const seconds = String(wholeSeconds % SECONDS_PER_MINUTE).padStart(2, '0');

  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}`
    : `${minutes}:${seconds}`;
};

const findEntryStartSeconds = (words: unknown[]): number | undefined =>
  words
    .map((word) => asRecord(asRecord(word)?.start_timestamp)?.relative)
    .find(
      (relative): relative is number =>
        isNumber(relative) && Number.isFinite(relative),
    );

const buildTranscriptLine = (entry: unknown): string | undefined => {
  const record = asRecord(entry);

  if (!isDefined(record) || !isArray(record.words)) {
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
  const startSeconds = findEntryStartSeconds(record.words);
  const timestamp = isDefined(startSeconds)
    ? `[${formatClockTimestamp(startSeconds)}] `
    : '';

  return `${timestamp}${speakerName}: ${text}`;
};

export const buildTeamsTranscriptSummaryPrompt = ({
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

  const header = isNonEmptyString(title?.trim())
    ? `Meeting title: ${title.trim()}\n\n`
    : '';

  return `${header}Transcript:\n${lines.join('\n')}`;
};
