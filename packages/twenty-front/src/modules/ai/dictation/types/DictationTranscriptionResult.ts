import { type DictationFailureReason } from '@/ai/dictation/types/DictationEngine';

// A result type rather than a thrown error so the transport decides what a
// failure means and the engine just relays it.
export type DictationTranscriptionResult =
  | { status: 'transcribed'; text: string }
  | { status: 'failed'; reason: DictationFailureReason };

export type TranscribeDictationAudio = (
  audio: Blob,
) => Promise<DictationTranscriptionResult>;
