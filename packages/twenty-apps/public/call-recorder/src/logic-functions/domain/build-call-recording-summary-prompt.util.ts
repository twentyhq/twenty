import { isArray, isNumber } from '@sniptt/guards';

import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { formatSecondsAsClockTimestamp } from 'src/logic-functions/utils/format-seconds-as-clock-timestamp.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const UNKNOWN_SPEAKER = 'Unknown speaker';

const readEntryStartSeconds = (words: unknown[]): number | undefined => {
  for (const word of words) {
    const relative = asRecord(asRecord(word)?.start_timestamp)?.relative;

    if (isNumber(relative) && Number.isFinite(relative)) {
      return relative;
    }
  }

  return undefined;
};

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
    startSeconds === undefined
      ? ''
      : `[${formatSecondsAsClockTimestamp(startSeconds)}] `;

  return `${timestamp}${speakerName}: ${text}`;
};

// The summarization instructions live in the agent's own prompt; the built
// prompt only carries the workspace admin's additional instructions on top.
export const buildCallRecordingSummaryPrompt = ({
  transcript,
  title,
  additionalSummaryPrompt,
}: {
  transcript: unknown;
  title?: string;
  additionalSummaryPrompt?: string;
}): string | undefined => {
  if (!isArray(transcript)) {
    return undefined;
  }

  const lines = transcript.map(buildTranscriptLine).filter(isNonEmptyString);

  if (lines.length === 0) {
    return undefined;
  }

  const additionalInstructions = isNonEmptyString(additionalSummaryPrompt)
    ? `Additional instructions from the workspace admin:\n${additionalSummaryPrompt.trim()}\n\n`
    : '';
  const header = isNonEmptyString(title)
    ? `Meeting title: ${title.trim()}\n\n`
    : '';

  return `${additionalInstructions}${header}Transcript:\n${lines.join('\n')}`;
};
