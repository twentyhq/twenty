import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { GOOGLE_MEET_UNKNOWN_SPEAKER_NAME } from 'src/logic-functions/constants/google-meet-call-summary.constant';
import { type TranscriptEntry } from 'src/logic-functions/types/transcript-entry.type';
import { formatSecondsAsClockTimestamp } from 'src/logic-functions/utils/format-seconds-as-clock-timestamp.util';

const formatStartTimestamp = (startSeconds: number | undefined): string => {
  if (!isDefined(startSeconds)) {
    return '';
  }

  return `[${formatSecondsAsClockTimestamp(startSeconds)}] `;
};

const buildTranscriptLine = ({
  participant,
  words,
}: TranscriptEntry): string | undefined => {
  const text = words
    .map((word) => word.text.trim())
    .filter(isNonEmptyString)
    .join(' ');

  if (!isNonEmptyString(text)) {
    return undefined;
  }

  return `${formatStartTimestamp(words[0]?.start_timestamp.relative)}${participant.name ?? GOOGLE_MEET_UNKNOWN_SPEAKER_NAME}: ${text}`;
};

export const buildGoogleMeetCallSummaryPrompt = ({
  title,
  transcriptEntries,
}: {
  title: string | undefined;
  transcriptEntries: TranscriptEntry[];
}): string | undefined => {
  const lines = transcriptEntries
    .map(buildTranscriptLine)
    .filter(isNonEmptyString);

  if (lines.length === 0) {
    return undefined;
  }

  const header = isNonEmptyString(title) ? `Meeting title: ${title}\n\n` : '';

  return `${header}Transcript:\n${lines.join('\n')}`;
};
