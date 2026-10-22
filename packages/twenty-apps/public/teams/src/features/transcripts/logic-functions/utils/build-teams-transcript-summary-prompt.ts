import { isArray, isNonEmptyString, isNumber, isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

const UNKNOWN_SPEAKER = 'Unknown speaker';
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3_600;

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

const getWordText = (word: unknown): unknown =>
  isObject(word) && 'text' in word ? word.text : undefined;

const getWordStartSeconds = (word: unknown): unknown =>
  isObject(word) &&
  'start_timestamp' in word &&
  isObject(word.start_timestamp) &&
  'relative' in word.start_timestamp
    ? word.start_timestamp.relative
    : undefined;

const getParticipantName = (entry: object): unknown =>
  'participant' in entry &&
  isObject(entry.participant) &&
  'name' in entry.participant
    ? entry.participant.name
    : undefined;

const findEntryStartSeconds = (words: unknown[]): number | undefined =>
  words
    .map(getWordStartSeconds)
    .find(
      (relative): relative is number =>
        isNumber(relative) && Number.isFinite(relative),
    );

const buildTranscriptLine = (entry: unknown): string | undefined => {
  if (!isObject(entry) || !('words' in entry) || !isArray(entry.words)) {
    return undefined;
  }

  const text = entry.words
    .map(getWordText)
    .filter(isNonEmptyString)
    .map((word) => word.trim())
    .join(' ')
    .trim();

  if (!isNonEmptyString(text)) {
    return undefined;
  }

  const participantName = getParticipantName(entry);
  const speakerName = isNonEmptyString(participantName)
    ? participantName.trim()
    : UNKNOWN_SPEAKER;
  const startSeconds = findEntryStartSeconds(entry.words);
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
