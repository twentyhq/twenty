import { isArray } from '@sniptt/guards';

import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const UNKNOWN_SPEAKER = 'Unknown speaker';

// Flattens one diarized transcript entry into a "Speaker: words" line, or
// undefined when the entry carries no usable text.
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

  return `${speakerName}: ${text}`;
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

  const lines = transcript
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
