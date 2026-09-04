import { isArray, isNonEmptyString, isNumber } from '@sniptt/guards';

import { UNKNOWN_SPEAKER_LABEL } from 'src/constants/teams.constant';
import { type TranscriptEntry } from 'src/logic-functions/types/transcript-entry.type';
import { formatSecondsAsClockTimestamp } from 'src/logic-functions/utils/format-seconds-as-clock-timestamp.util';

const isTranscriptEntry = (entry: unknown): entry is TranscriptEntry =>
  typeof entry === 'object' &&
  entry !== null &&
  isArray((entry as TranscriptEntry).words);

const buildTranscriptLine = (entry: TranscriptEntry): string | undefined => {
  const text = entry.words
    .map((word) => word.text)
    .filter(isNonEmptyString)
    .join(' ')
    .trim();

  if (!isNonEmptyString(text)) {
    return undefined;
  }

  const speakerName = isNonEmptyString(entry.participant?.name)
    ? entry.participant.name.trim()
    : UNKNOWN_SPEAKER_LABEL;
  const startSeconds = entry.words.find((word) =>
    isNumber(word.start_timestamp?.relative),
  )?.start_timestamp?.relative;
  const timestamp =
    startSeconds === undefined
      ? ''
      : `[${formatSecondsAsClockTimestamp(startSeconds)}] `;

  return `${timestamp}${speakerName}: ${text}`;
};

export const buildCallSummaryPrompt = ({
  transcript,
  title,
}: {
  transcript: unknown;
  title?: string;
}): string | undefined => {
  if (!isArray(transcript)) {
    return undefined;
  }

  const lines = transcript
    .filter(isTranscriptEntry)
    .map(buildTranscriptLine)
    .filter(isNonEmptyString);

  if (lines.length === 0) {
    return undefined;
  }

  const header = isNonEmptyString(title)
    ? `Meeting title: ${title.trim()}\n\n`
    : '';

  return `${header}Transcript:\n${lines.join('\n')}`;
};
