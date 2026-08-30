import { type DictationFailureReason } from '@/ai/dictation/types/DictationFailureReason';

// 'aborted' is absent on purpose: it is what a deliberate stop() produces, and
// treating it as a failure would surface an error every time a user finishes.
export const mapSpeechRecognitionError = (
  error: string,
): DictationFailureReason | undefined => {
  switch (error) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'permission-denied';
    case 'audio-capture':
      return 'no-device';
    case 'network':
      return 'network';
    case 'aborted':
    // The engine ran and heard nothing, which is a quiet room rather than a
    // broken engine — the session just ends with no transcript.
    case 'no-speech':
      return undefined;
    default:
      return 'engine-error';
  }
};
