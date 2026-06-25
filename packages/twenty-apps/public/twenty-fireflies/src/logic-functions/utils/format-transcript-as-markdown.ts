import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'src/utils/is-defined';

import { type FirefliesTranscript } from 'src/logic-functions/types/fireflies-transcript.type';

const UNKNOWN_SPEAKER_LABEL = 'Speaker';
const EMPTY_TRANSCRIPT_MESSAGE =
  '_Fireflies returned no transcript content for this meeting._';

export const formatTranscriptAsMarkdown = (
  transcript: FirefliesTranscript,
): string => {
  const sentences = transcript.sentences ?? [];

  const lines: string[] = [];
  let currentSpeaker: string | null = null;
  let currentLines: string[] = [];

  const flush = () => {
    if (!isNonEmptyArray(currentLines)) {
      return;
    }

    const speakerLabel = isDefined(currentSpeaker)
      ? currentSpeaker
      : UNKNOWN_SPEAKER_LABEL;

    lines.push(`**${speakerLabel}:** ${currentLines.join(' ')}`);
    currentLines = [];
  };

  for (const sentence of sentences) {
    const text = sentence.text.trim();

    if (!isNonEmptyString(text)) {
      continue;
    }

    const trimmedSpeaker = sentence.speaker_name?.trim();
    const speaker = isNonEmptyString(trimmedSpeaker) ? trimmedSpeaker : null;

    if (speaker !== currentSpeaker) {
      flush();
      currentSpeaker = speaker;
    }

    currentLines.push(text);
  }

  flush();

  if (!isNonEmptyArray(lines)) {
    return EMPTY_TRANSCRIPT_MESSAGE;
  }

  return lines.join('\n\n');
};
