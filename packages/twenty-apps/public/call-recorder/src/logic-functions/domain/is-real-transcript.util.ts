import { isArray } from '@sniptt/guards';

// A "real" transcript is the diarized array Recall returns once transcription
// finishes. PENDING/FAILED markers are plain objects, and an unset transcript
// is null/undefined — neither is an array, so both are excluded.
export const isRealTranscript = (transcript: unknown): boolean =>
  isArray(transcript) && transcript.length > 0;
