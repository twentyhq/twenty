import { isNonEmptyString } from '@sniptt/guards';

import { type TranscriptEntry } from 'src/features/transcripts/logic-functions/types/transcript-entry.type';

export const hasNamedTranscriptParticipant = (
  transcriptEntries: TranscriptEntry[],
): boolean =>
  transcriptEntries.some(({ participant }) =>
    isNonEmptyString(participant.name),
  );
